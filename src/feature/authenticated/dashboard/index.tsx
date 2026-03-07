import AppHeader from '@/components/layout/authenticated/app-header'
import Search from '@/components/search'

const Forbidden = () => {
  return (
    <>
      <AppHeader>
        <Search />
      </AppHeader>
      <div>{123}</div>
    </>
  )
}

export default Forbidden
