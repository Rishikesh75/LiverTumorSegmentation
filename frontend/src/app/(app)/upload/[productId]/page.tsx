import { UploadPageContent } from '@presentation/section/upload-page-content'

interface UploadPageProps {
  params: Promise<{ productId: string }>
}

export default async function UploadPage({ params }: UploadPageProps) {
  const { productId } = await params
  return <UploadPageContent productId={productId} />
}
