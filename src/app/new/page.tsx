// app/new/page.tsx
// Re-uses the EditAlbumPage component for the /new route.
// When mounted here there is no albumId in the URL,
// so EditAlbumPage automatically switches to "create" mode (POST instead of PUT).
// No 'use client' needed here — the imported component already declares it.

export { default } from '../edit/[albumId]/page';
