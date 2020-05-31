import { useState } from 'react';

function useImageCache() {
  const [cache, setCache] = useState({});

  function cacheImage(imageId, file) {
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      setCache({...cache, [imageId]: reader.result});
    });

    reader.readAsDataURL(file);
  }

  return [cache, cacheImage];
}

export default useImageCache;
