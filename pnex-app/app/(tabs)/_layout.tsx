import { useState } from "react"
import { Tabs } from "expo-router"
import { TabBar } from "@/components/TabBar"
import NewDealModal from "@/components/NewDealModal"
import { Colors } from "@/constants/theme"

export default function TabsLayout() {
  const [plusVisible, setPlusVisible] = useState(false)

  return (
    <>
      <NewDealModal visible={plusVisible} onClose={() => setPlusVisible(false)} />
      <Tabs
        tabBar={(props) => <TabBar {...props} onPlusPress={() => setPlusVisible(true)} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: Colors.paper },
        }}
      >
      <Tabs.Screen name="wall" />
      <Tabs.Screen name="network" />
      <Tabs.Screen name="account" />
      </Tabs>
    </>
  )
}
