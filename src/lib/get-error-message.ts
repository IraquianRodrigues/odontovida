/**
 * Safely extracts a user-friendly error message from an unknown error value.
 * Replaces `catch (error: any) { error.message }` pattern across all services.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return 'Ocorreu um erro inesperado';
}
