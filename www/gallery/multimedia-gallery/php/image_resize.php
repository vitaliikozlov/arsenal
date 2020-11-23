<?php

function lastIndexOf($string,$item){  
    $index=strpos(strrev($string),strrev($item));  
    if ($index){  
        $index=strlen($string)-strlen($item)-$index;  
        return $index;  
    } else{
	    return -1;  
	}  
}  

function imageResize($src, $dst, $side, $size, $quality=100){

  if(!list($w, $h) = getimagesize($src)) return "Unsupported picture type!";

  //get file name
  $pic_ext = strtolower(substr(strrchr($src,"."),0));
  $name_slash = lastIndexOf($src,"/"); 
  $name_start = $name_slash ? $name_slash+1 : 0;
  $name_dot =lastIndexOf($src,"."); 
  $name_end =$name_dot - $name_start;
  $pic_name = substr( $src, $name_start, $name_end ); 
  //echo($pic_name);
  
  //get extension
  $type = strtolower(substr(strrchr($src,"."),1));
  if($type == 'jpeg') $type = 'jpg';
  switch($type){
    case 'bmp': $img = imagecreatefromwbmp($src); break;
    case 'gif': $img = imagecreatefromgif($src); break;
    case 'jpg': $img = imagecreatefromjpeg($src); break;
    case 'png': $img = imagecreatefrompng($src); break;
    default : return "Unsupported picture type!";
  }
  
  if(file_exists($dst.$pic_name.$pic_ext)) {
	@unlink($dst.$pic_name.$pic_ext);
  }
  
  // get image size
  $width = imagesx($img);
  $height = imagesy($img);
  
  // calculate thumbnail size
  if($side == 'h'){
	$new_height = $size;
    $new_width = floor( $width * ( $size / $height ) );
  }else{
	$new_width = $size;
    $new_height = floor( $height * ( $size / $width ) );
  }

   // create a new tempopary image
  $new = imagecreatetruecolor($new_width, $new_height);

  // preserve transparency
  if($type == "gif" or $type == "png"){
    imagecolortransparent($new, imagecolorallocatealpha($new, 0, 0, 0, 127));
    imagealphablending($new, false);
    imagesavealpha($new, true);
  }

  //bool imagecopyresampled ( resource $dst_image , resource $src_image , int $dst_x , int $dst_y , int $src_x , int $src_y , int $dst_w , int $dst_h , int $src_w , int $src_h )
  imagecopyresampled($new, $img, 0, 0, 0, 0, $new_width, $new_height, $w, $h);
  
  switch($type){
    case 'bmp': imagewbmp($new, $dst.$pic_name.$pic_ext, $quality); break;
    case 'gif': imagegif($new, $dst.$pic_name.$pic_ext, $quality); break;
    case 'jpg': imagejpeg($new, $dst.$pic_name.$pic_ext, $quality); break;
    case 'png': imagepng($new, $dst.$pic_name.$pic_ext, $quality); break;
  }
  return true;
}


$src = $_REQUEST['src'];
$dst = $_REQUEST['dst'];
$side = $_REQUEST['side'];
$size = $_REQUEST['size'];
$quality = $_REQUEST['quality'];

imageResize($src,$dst,$side,$size,$quality);


?>