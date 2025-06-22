"use client"

import { motion } from "framer-motion"
import { Cloud, Database, Globe, History, MapPin, TrendingUp, Zap, Activity } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

const menuItems = [
  {
    id: "overview",
    title: "Station Overview",
    icon: MapPin,
    description: "Stations map and status",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "realtime",
    title: "Real-time Weather",
    icon: Zap,
    description: "Live weather data",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    id: "historical",
    title: "Historical Analysis",
    icon: History,
    description: "Trends and patterns",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "forecast",
    title: "Forecast Analysis",
    icon: Cloud,
    description: "Predictions and accuracy",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "performance",
    title: "Model Performance",
    icon: TrendingUp,
    description: "Model rankings",
    gradient: "from-red-500 to-rose-500",
  },
  {
    id: "geographic",
    title: "Geographic Analysis",
    icon: Globe,
    description: "Cell-based insights",
    gradient: "from-indigo-500 to-blue-500",
  },
]

interface AppSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  return (
    <Sidebar className="border-r-0 shadow-xl bg-gradient-to-b from-white to-slate-50">
      <SidebarHeader className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Database className="h-8 w-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-white">WeatherXM</h2>
            <p className="text-sm text-blue-100">Analytics Platform</p>
          </div>
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Analytics Sections
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SidebarMenuButton
                      onClick={() => setActiveSection(item.id)}
                      isActive={activeSection === item.id}
                      className={`
                        relative overflow-hidden rounded-xl p-4 h-auto transition-all duration-300
                        ${
                          activeSection === item.id
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                            : "hover:bg-slate-100 hover:scale-102"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <item.icon className="h-5 w-5" />
                        </motion.div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-sm">{item.title}</div>
                          <div
                            className={`text-xs ${
                              activeSection === item.id ? "text-white/80" : "text-muted-foreground"
                            }`}
                          >
                            {item.description}
                          </div>
                        </div>
                      </div>
                      {activeSection === item.id && (
                        <motion.div
                          className="absolute inset-0 bg-white/20 rounded-xl"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t bg-gradient-to-r from-slate-50 to-blue-50">
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
              <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                <Activity className="h-3 w-3 mr-1" />
                API Connected
              </Badge>
            </motion.div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Live Data
          </Badge>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  )
}
