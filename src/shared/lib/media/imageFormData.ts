import { PlatformOS } from '../constants/platformOS';

export const buildImageFormData = async (uri: string) => {
  const fd = new FormData();

  if (PlatformOS.WEB) {
    const r = await fetch(uri);
    const blob = await r.blob();
    fd.append('file', blob, 'image.jpg');

    return fd;
  }

  fd.append('file', {
    uri,
    name: 'image.jpg',
    type: 'image/jpeg',
  } as any);

  return fd;
};

export const buildImagesFormData = async (uris: string[]) => {
  const fd = new FormData();

  if (PlatformOS.WEB) {
    for (let i = 0; i < uris.length; i++) {
      const r = await fetch(uris[i]);
      const blob = await r.blob();
      fd.append('files[]', blob, `image-${i}.jpg`);
    }

    return fd;
  }

  for (let i = 0; i < uris.length; i++) {
    fd.append('files[]', {
      uri: uris[i],
      name: `image-${i}.jpg`,
      type: 'image/jpeg',
    } as any);
  }

  return fd;
};
