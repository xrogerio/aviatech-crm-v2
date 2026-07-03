import { useTheme } from '@/components/theme-provider'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const PreviewMockup = ({ mode }: { mode: 'dark' | 'light' }) => {
  const isDark = mode === 'dark'
  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col',
        isDark ? 'bg-[#27272a]' : 'bg-white',
      )}
    >
      <div
        className={cn(
          'h-4 flex items-center px-2 space-x-1 border-b',
          isDark ? 'border-[#3f3f46]' : 'border-[#e4e4e7]',
        )}
      >
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            isDark ? 'bg-[#52525b]' : 'bg-[#e4e4e7]',
          )}
        />
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            isDark ? 'bg-[#52525b]' : 'bg-[#e4e4e7]',
          )}
        />
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            isDark ? 'bg-[#52525b]' : 'bg-[#e4e4e7]',
          )}
        />
      </div>
      <div className="flex flex-1 p-1.5 gap-1.5">
        <div className="w-[30%] flex flex-col gap-1.5">
          <div
            className={cn(
              'w-full h-1.5 rounded-sm',
              isDark ? 'bg-[#3f3f46]' : 'bg-[#f4f4f5]',
            )}
          />
          <div
            className={cn(
              'w-2/3 h-1.5 rounded-sm',
              isDark ? 'bg-[#3f3f46]' : 'bg-[#f4f4f5]',
            )}
          />
          <div
            className={cn(
              'w-4/5 h-1.5 rounded-sm',
              isDark ? 'bg-[#3f3f46]' : 'bg-[#f4f4f5]',
            )}
          />
        </div>
        <div
          className={cn(
            'flex-1 rounded-sm p-1.5 flex flex-col gap-1.5',
            isDark ? 'bg-[#3f3f46]' : 'bg-[#f4f4f5]',
          )}
        >
          <div
            className={cn(
              'w-1/2 h-1.5 rounded-sm',
              isDark ? 'bg-[#52525b]' : 'bg-[#e4e4e7]',
            )}
          />
          <div
            className={cn(
              'w-1/3 h-1.5 rounded-sm',
              isDark ? 'bg-[#52525b]' : 'bg-[#e4e4e7]',
            )}
          />
          <div className="mt-auto flex gap-1.5">
            <div
              className={cn(
                'flex-1 h-6 rounded-sm',
                isDark ? 'bg-[#52525b]' : 'bg-[#e4e4e7]',
              )}
            />
            <div
              className={cn(
                'flex-1 h-6 rounded-sm',
                isDark ? 'bg-[#52525b]' : 'bg-[#e4e4e7]',
              )}
            />
            <div
              className={cn(
                'flex-1 h-6 rounded-sm',
                isDark ? 'bg-[#52525b]' : 'bg-[#e4e4e7]',
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export function GeneralSettings() {
  const { theme, setTheme } = useTheme()

  const activeTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
          <CardDescription>Altere o tema do Sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={activeTheme}
            onValueChange={(value) => setTheme(value as 'light' | 'dark')}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
          >
            <div>
              <RadioGroupItem
                value="light"
                id="theme-light"
                className="peer sr-only"
                aria-label="Claro"
              />
              <Label
                htmlFor="theme-light"
                className={cn(
                  'flex h-full flex-col items-start p-4 rounded-xl border-2 cursor-pointer transition-all',
                  activeTheme === 'light'
                    ? 'border-emerald-500 bg-[#d1fae5] dark:bg-emerald-900/30'
                    : 'border-transparent bg-card shadow-sm ring-1 ring-border hover:bg-accent/50',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                )}
              >
                <div className="flex items-center space-x-2 mb-2 text-foreground">
                  <Sun className="w-5 h-5" />
                  <span className="font-semibold text-base">Claro</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6 font-normal">
                  Tela mais brilhante e vibrante
                </p>
                <div className="w-full mt-auto">
                  <div className="relative w-full aspect-[1.4/1] rounded-lg overflow-hidden border shadow-sm border-zinc-200 dark:border-zinc-800">
                    <PreviewMockup mode="light" />
                  </div>
                </div>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="dark"
                id="theme-dark"
                className="peer sr-only"
                aria-label="Escuro"
              />
              <Label
                htmlFor="theme-dark"
                className={cn(
                  'flex h-full flex-col items-start p-4 rounded-xl border-2 cursor-pointer transition-all',
                  activeTheme === 'dark'
                    ? 'border-emerald-500 bg-[#d1fae5] dark:bg-emerald-900/30'
                    : 'border-transparent bg-card shadow-sm ring-1 ring-border hover:bg-accent/50',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                )}
              >
                <div className="flex items-center space-x-2 mb-2 text-foreground">
                  <Moon className="w-5 h-5" />
                  <span className="font-semibold text-base">Escuro</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6 font-normal">
                  Tela escura, ideal para ambientes com pouca luz
                </p>
                <div className="w-full mt-auto">
                  <div className="relative w-full aspect-[1.4/1] rounded-lg overflow-hidden border shadow-sm border-zinc-200 dark:border-zinc-800">
                    <PreviewMockup mode="dark" />
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}
