import { toast as sonnerToast } from 'sonner'

type ToastProps = {
  title?: string
  description?: string
}

export function toastSuccess({ title, description }: ToastProps) {
  return sonnerToast.success(title, { description })
}

export function toastError({ title, description }: ToastProps) {
  return sonnerToast.error(title, { description })
}

export function toastInfo({ title, description }: ToastProps) {
  return sonnerToast.info(title, { description })
}
