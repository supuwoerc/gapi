import * as React from 'react'

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import type { Project } from '@/schema/project/project'
import { getProjects } from '@/service/projects/projects'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useActiveProjectStore } from '@/store/active-project'

import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Spinner } from '@/components/ui/spinner'

const PAGE_SIZE = 10
const SCROLL_THRESHOLD = 50
const DEBOUNCE_MS = 300

const EmptyProjects: Project[] = []

function ProjectSwitcher() {
  const { isMobile } = useSidebar()
  const { t } = useTranslation('global')

  const [open, setOpen] = React.useState(false)
  const [keyword, setKeyword] = React.useState('')
  const [debouncedKeyword, setDebouncedKeyword] = React.useState('')

  const { activeProjectId, setActiveProjectId } = useActiveProjectStore()

  const debouncedSetKeyword = useDebouncedCallback((value: string) => {
    setDebouncedKeyword(value)
  }, DEBOUNCE_MS)

  const {
    data: projectsPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['sidebar-projects', { keyword: debouncedKeyword }],
    queryFn: ({ pageParam }) =>
      getProjects({
        page: pageParam,
        perPage: PAGE_SIZE,
        keyword: debouncedKeyword || undefined,
      }),
    getNextPageParam: (_lastPage, allPages) => {
      const loaded = allPages.reduce((count, page) => count + page.data.length, 0)
      const total = allPages[0]?.total ?? 0
      return loaded < total ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  })

  const projects = React.useMemo(
    () => projectsPages?.pages.flatMap((page) => page.data) ?? EmptyProjects,
    [projectsPages?.pages]
  )

  // Resolve active project from store, fallback to first loaded
  const activeProject = React.useMemo(() => {
    if (activeProjectId !== null) {
      const found = projects.find((p) => p.id === activeProjectId)
      if (found) return found
    }
    return projects[0] ?? null
  }, [projects, activeProjectId])

  // Set active project id on first load if not set
  React.useEffect(() => {
    if (activeProjectId === null && projects.length > 0) {
      setActiveProjectId(projects[0].id)
    }
  }, [activeProjectId, projects, setActiveProjectId])

  const handleSelect = (project: Project) => {
    setActiveProjectId(project.id)
    setOpen(false)
  }

  const handleSearchChange = (value: string) => {
    setKeyword(value)
    debouncedSetKeyword(value)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (
      scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {activeProject ? (
                <>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <img
                      src={activeProject.logo}
                      alt={activeProject.name}
                      className="size-4 rounded-sm"
                    />
                  </div>
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-semibold">{activeProject.name}</span>
                    <span className="truncate text-xs">{activeProject.description}</span>
                  </div>
                </>
              ) : (
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate text-muted-foreground">{t('menu.selectProject')}</span>
                </div>
              )}
              <ChevronsUpDown className="ms-auto" />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent
            className="w-(--radix-popover-trigger-width) min-w-56 p-0"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={t('menu.searchProject')}
                value={keyword}
                onValueChange={handleSearchChange}
              />
              <CommandList onScroll={handleScroll}>
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Spinner />
                  </div>
                ) : (
                  <>
                    <CommandEmpty>{t('menu.noProjectFound')}</CommandEmpty>
                    <CommandGroup>
                      {projects.map((project) => (
                        <CommandItem
                          key={project.id}
                          value={String(project.id)}
                          onSelect={() => handleSelect(project)}
                          className="gap-2 p-2"
                        >
                          <div className="flex size-6 items-center justify-center rounded-sm border">
                            <img
                              src={project.logo}
                              alt={project.name}
                              className="size-4 rounded-sm"
                            />
                          </div>
                          <span className="flex-1 truncate">{project.name}</span>
                          {activeProject?.id === project.id && (
                            <Check className="size-4 text-muted-foreground" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {isFetchingNextPage && (
                      <div className="flex items-center justify-center py-2">
                        <Spinner />
                      </div>
                    )}
                  </>
                )}
              </CommandList>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <span className="font-medium text-muted-foreground">{t('menu.addProject')}</span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default ProjectSwitcher
