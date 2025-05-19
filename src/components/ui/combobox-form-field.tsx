"use client"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ComboboxFormFieldProps {
    options: { value: string; label: string }[]
    placeholder?: string
    emptyMessage?: string
    onChange?: (value: string) => void
    value?: string
    className?: string
}

export function ComboboxFormField({
    options,    
    emptyMessage = "No options found.",
    onChange,
    value: controlledValue,
    className,
}: ComboboxFormFieldProps) {
    const [open, setOpen] = useState(false)
    const [internalValue, setInternalValue] = useState("")

    // Use controlled value if provided, otherwise use internal state
    const value = controlledValue !== undefined ? controlledValue : internalValue

    // Handle both selection from dropdown and manual input
    const handleValueChange = (newValue: string) => {
        if (onChange) {
            onChange(newValue)
        } else {
            setInternalValue(newValue)
        }
        // Only close the popover when selecting from the dropdown
        setOpen(false)
    }

    return (
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant='outline' role='combobox' aria-expanded={open} className={cn('w-full justify-between', className)}>
						{value ? options.find((option) => option.value === value)?.label || value : ''}
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[200px] p-0'>
					<Command>
						<CommandInput
							placeholder='Search or enter value...'
							value={value}
							onValueChange={(inputValue) => {
								if (onChange) {
									onChange(inputValue);
								} else {
									setInternalValue(inputValue);
								}
							}}
						/>
						<CommandList>
							{options.filter((option) => option.label.toLowerCase().includes(value.toLowerCase()) || option.value.toLowerCase().includes(value.toLowerCase()))
								.length === 0 && value ? (
								<CommandItem value={value} onSelect={handleValueChange} className='text-muted-foreground'>
									Create &quot;{value}&quot;
								</CommandItem>
							) : (
								<CommandEmpty>{emptyMessage}</CommandEmpty>
							)}
							<CommandGroup>
								{options
									.filter((option) => option.label.toLowerCase().includes(value.toLowerCase()) || option.value.toLowerCase().includes(value.toLowerCase()))
									.map((option) => (
										<CommandItem key={option.value} value={option.value} onSelect={handleValueChange}>
											<Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
											{option.label}
										</CommandItem>
									))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		);
}

