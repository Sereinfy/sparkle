import { Button, Card, CardBody, CardFooter, Progress } from '@nextui-org/react'
import { useProfileConfig } from '@renderer/hooks/use-profile-config'
import { useLocation, useNavigate } from 'react-router-dom'
import { calcTraffic, calcPercent } from '@renderer/utils/calc'
import { IoMdRefresh } from 'react-icons/io'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import dayjs from 'dayjs'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const ProfileCard: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const match = location.pathname.includes('/profiles')

  const { profileConfig } = useProfileConfig()
  const { current, items } = profileConfig ?? {}
  const info = items?.find((item) => item.id === current) ?? {
    id: 'default',
    type: 'local',
    name: '空白订阅'
  }

  const extra = info?.extra
  const usage = (extra?.upload ?? 0) + (extra?.download ?? 0)
  const total = extra?.total ?? 0

  return (
    <Card
      fullWidth
      className={`mb-2 ${match ? 'bg-primary' : ''}`}
      isPressable
      onPress={() => navigate('/profiles')}
    >
      <CardBody className="pb-1">
        <div className="flex justify-between h-[32px]">
          <h3 className="select-none text-ellipsis whitespace-nowrap overflow-hidden text-md font-bold leading-[32px]">
            {info?.name}
          </h3>
          <Button isIconOnly size="sm" variant="light" color="default">
            <IoMdRefresh color="default" className="text-[24px]" />
          </Button>
        </div>
        <div className="mt-2 flex justify-between">
          <small>{extra ? `${calcTraffic(usage)}/${calcTraffic(total)}` : undefined}</small>
          <small>{dayjs(info.updated).fromNow()}</small>
        </div>
      </CardBody>
      <CardFooter className="pt-0">
        {extra && (
          <Progress
            className="w-full"
            classNames={{ indicator: 'bg-foreground', label: 'select-none' }}
            value={calcPercent(extra?.upload, extra?.download, extra?.total)}
          />
        )}
      </CardFooter>
    </Card>
  )
}

export default ProfileCard
