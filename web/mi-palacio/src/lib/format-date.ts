export function formatDateTimeEsMx(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}
