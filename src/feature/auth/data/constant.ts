import ufo from '@/assets/auth/ufo.png'
import write from '@/assets/auth/write.png'

export const codeSnippets = [
  `type APIEndpoint struct {
      Method      string
      Path        string
      ID          string
      Name        string
      Status      string
      Description string
      CreatedAt   time.Time
      UpdatedAt   time.Time
      Metadata    map[string]string
      Response    map[string]interface{}
      Request     map[string]interface{}
  }`,

  `interface APIEndpoint {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    path: string
    method: string
    status: string
    description: string
    metadata: Record<string, string>
    response: Record<string, any>
    request: Record<string, any>
  }`,
]

export const langs = ['go', 'typescript']

export const carouselItems = [
  {
    title: 'auth.carousel.t1',
    subTitle: 'auth.carousel.st1',
  },
  {
    title: 'auth.carousel.t2',
    subTitle: 'auth.carousel.st2',
    image: write,
  },
  {
    title: 'auth.carousel.t3',
    subTitle: 'auth.carousel.st3',
    image: ufo,
  },
]
