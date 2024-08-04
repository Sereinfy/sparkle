import { Avatar, Button, Card, CardBody } from '@nextui-org/react'
import BasePage from '@renderer/components/base/base-page'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { mihomoChangeProxy, mihomoProxies, mihomoProxyDelay } from '@renderer/utils/ipc'
import { CgDetailsLess, CgDetailsMore } from 'react-icons/cg'
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { GroupedVirtuoso } from 'react-virtuoso'
import ProxyItem from '@renderer/components/proxies/proxy-item'
import { IoIosArrowBack } from 'react-icons/io'
import { MdOutlineSpeed } from 'react-icons/md'

const Proxies: React.FC = () => {
  const { data: proxies, mutate } = useSWR('mihomoProxies', mihomoProxies)
  const { appConfig, patchAppConfig } = useAppConfig()
  const { proxyDisplayMode = 'simple' } = appConfig || {}

  const groups = useMemo(() => {
    const groups: IMihomoGroup[] = []
    if (proxies) {
      const globalGroup = proxies.proxies['GLOBAL'] as IMihomoGroup
      for (const global of globalGroup.all) {
        if (isGroup(proxies.proxies[global])) {
          groups.push(proxies.proxies[global] as IMihomoGroup)
        }
      }
      Object.keys(proxies.proxies).forEach((key) => {
        if (isGroup(proxies.proxies[key])) {
          if (!groups.find((group) => group.name === key)) {
            groups.push(proxies.proxies[key] as IMihomoGroup)
          }
        }
      })
    }
    return groups
  }, [proxies])

  const [isOpen, setIsOpen] = useState(Array(groups.length).fill(false))

  const { groupCounts, allProxies } = useMemo(() => {
    const groupCounts = groups.map((group, index) => {
      return isOpen[index] ? group.all.length : 0
    })
    const allProxies: (IMihomoProxy | IMihomoGroup)[] = []
    groups.forEach((group, index) => {
      if (isOpen[index] && proxies) {
        allProxies.push(...group.all.map((name) => proxies.proxies[name]))
      }
    })

    return { groupCounts, allProxies }
  }, [groups, isOpen])

  const onChangeProxy = (group: string, proxy: string): void => {
    mihomoChangeProxy(group, proxy).then(() => {
      mutate()
    })
  }

  const onProxyDelay = async (proxy: string, url?: string): Promise<IMihomoDelay> => {
    return await mihomoProxyDelay(proxy, url)
  }

  return (
    <BasePage
      title="代理组"
      header={
        <Button
          size="sm"
          isIconOnly
          onPress={() => {
            patchAppConfig({ proxyDisplayMode: proxyDisplayMode === 'simple' ? 'full' : 'simple' })
          }}
        >
          {proxyDisplayMode === 'simple' ? (
            <CgDetailsMore size={20} />
          ) : (
            <CgDetailsLess size={20} />
          )}
        </Button>
      }
    >
      <GroupedVirtuoso
        style={{ height: 'calc(100vh - 50px)' }}
        groupCounts={groupCounts}
        groupContent={(index) => {
          return (
            <div className={`w-full pt-2 ${index === groupCounts.length - 1 ? 'pb-2' : ''} px-2`}>
              <Card
                isPressable
                fullWidth
                onPress={() => {
                  setIsOpen((prev) => {
                    const newOpen = [...prev]
                    newOpen[index] = !prev[index]
                    return newOpen
                  })
                }}
              >
                <CardBody>
                  <div className="flex justify-between">
                    <div className="flex">
                      {groups[index].icon.length > 0 ? (
                        <Avatar
                          className="bg-transparent mr-2"
                          size="sm"
                          radius="sm"
                          src={groups[index].icon}
                        />
                      ) : null}
                      <div className="h-[32px] text-md leading-[32px]">
                        {groups[index].name}
                        {proxyDisplayMode === 'full' && (
                          <>
                            <div className="inline ml-2 text-sm text-default-500">
                              {groups[index].type}
                            </div>
                            <div className="inline ml-2 text-sm text-default-500">
                              {groups[index].now}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex">
                      <Button
                        variant="light"
                        size="sm"
                        isIconOnly
                        onPress={() => {
                          PubSub.publish(`${groups[index].name}-delay`)
                        }}
                      >
                        <MdOutlineSpeed className="text-lg text-default-500" />
                      </Button>
                      <IoIosArrowBack
                        className={`transition duration-200 ml-2 h-[32px] text-lg text-default-500 ${isOpen[index] ? '-rotate-90' : ''}`}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )
        }}
        itemContent={(index, groupIndex) => {
          return allProxies[index] ? (
            <div className="pt-2 mx-2">
              <ProxyItem
                onProxyDelay={onProxyDelay}
                onSelect={onChangeProxy}
                proxy={allProxies[index]}
                group={groups[groupIndex].name}
                proxyDisplayMode={proxyDisplayMode}
                selected={allProxies[index]?.name === groups[groupIndex].now}
              />
            </div>
          ) : (
            <div>Never See This</div>
          )
        }}
      />
    </BasePage>
  )
}

function isGroup(proxy: IMihomoProxy | IMihomoGroup): proxy is IMihomoGroup {
  return 'all' in proxy
}

export default Proxies
