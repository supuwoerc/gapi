import { useOutlet } from 'react-router'

const FullscreenLayout: React.FC = () => {
  const currentOutlet = useOutlet()
  return <>{currentOutlet}</>
}

export default FullscreenLayout
