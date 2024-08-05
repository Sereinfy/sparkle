import { Button, Input, Switch } from '@nextui-org/react'
import BasePage from '@renderer/components/base/base-page'
import SettingCard from '@renderer/components/base/base-setting-card'
import SettingItem from '@renderer/components/base/base-setting-item'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { checkAutoRun, enableAutoRun, disableAutoRun, quitApp } from '@renderer/utils/ipc'
import { IoLogoGithub } from 'react-icons/io5'

import useSWR from 'swr'

const Settings: React.FC = () => {
  const { data: enable, mutate } = useSWR('checkAutoRun', checkAutoRun, {
    errorRetryCount: 5,
    errorRetryInterval: 200
  })

  const { appConfig, patchAppConfig } = useAppConfig()
  const { silentStart = false, delayTestUrl, delayTestTimeout } = appConfig || {}

  return (
    <BasePage
      title="应用设置"
      header={
        <Button
          isIconOnly
          size="sm"
          onPress={() => {
            window.open('https://github.com/pompurin404/mihomo-party')
          }}
        >
          <IoLogoGithub className="text-lg" />
        </Button>
      }
    >
      <SettingCard>
        <SettingItem title="开机自启" divider>
          <Switch
            size="sm"
            isSelected={enable}
            onValueChange={(v) => {
              if (v) {
                enableAutoRun()
              } else {
                disableAutoRun()
              }
              mutate()
            }}
          />
        </SettingItem>
        <SettingItem title="静默启动">
          <Switch
            size="sm"
            isSelected={silentStart}
            onValueChange={(v) => {
              patchAppConfig({ silentStart: v })
            }}
          />
        </SettingItem>
      </SettingCard>
      <SettingCard>
        <SettingItem title="延迟测试地址" divider>
          <Input
            size="sm"
            className="w-[60%]"
            value={delayTestUrl}
            placeholder="默认https://www.gstatic.com/generate_204"
            onValueChange={(v) => {
              patchAppConfig({ delayTestUrl: v })
            }}
          ></Input>
        </SettingItem>
        <SettingItem title="延迟测试超时时间">
          <Input
            type="number"
            size="sm"
            className="w-[60%]"
            value={delayTestTimeout?.toString()}
            placeholder="默认5000"
            onValueChange={(v) => {
              patchAppConfig({ delayTestTimeout: parseInt(v) })
            }}
          ></Input>
        </SettingItem>
      </SettingCard>
      <SettingCard>
        <SettingItem title="退出应用" onPress={quitApp} />
      </SettingCard>
    </BasePage>
  )
}

export default Settings
