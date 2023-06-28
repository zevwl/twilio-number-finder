'use client'

import { FormEvent, useState } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from '@nextui-org/react'
import { PhoneNumberCapabilities } from 'twilio/lib/interfaces'
import { LocalInstance } from 'twilio/lib/rest/api/v2010/account/availablePhoneNumberCountry/local'

// Capabilities are typed in lowercase, but the actual response is in uppercase
interface CustomCapabilities extends PhoneNumberCapabilities {
  SMS?: boolean
  MMS?: boolean
}

export default function Home() {
  const [isSearchingNumbers, setIsSearchingNumbers] = useState(false)
  const [phoneNumbersResult, setPhoneNumbersResult] = useState<LocalInstance[]>(
    []
  )
  const [noResultsMessage, setNoResultsMessage] = useState('')

  const [areaCode, setAreaCode] = useState('845')
  const [ending, setEnding] = useState('')
  const [limit, setLimit] = useState('20')

  async function searchPhoneNumbers(event: FormEvent) {
    event.preventDefault()

    const searchParams = new URLSearchParams()
    searchParams.set('areaCode', areaCode)
    searchParams.set('ends', ending)

    if (!areaCode && !ending) {
      searchParams.set('limit', '20')
    }

    setIsSearchingNumbers(true)
    setNoResultsMessage('')
    try {
      const response = await fetch(`/api?${searchParams}`)
      const data = await response.json()
      setPhoneNumbersResult(data)

      if (!data?.length) {
        setNoResultsMessage('No Results')
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsSearchingNumbers(false)
      setNoResultsMessage('Error occurred, check logs for details.')
    }
  }

  return (
    <div className="container mx-auto">
      <div className="h-screen flex flex-row flex-wrap py-4">
        <main role="main" className="w-full h-full pa-2">
          <form
            className="max-w-md flex flex-col gap-2"
            onSubmit={(evt) => searchPhoneNumbers(evt)}
          >
            <Input
              label="Area Code"
              value={areaCode}
              onValueChange={(value) => setAreaCode(value)}
            />
            <Input
              label="Last 4 Digits"
              value={ending}
              onValueChange={(value) => setEnding(value)}
            />
            <Dropdown>
              <DropdownTrigger>
                <Button>Limit: {limit}</Button>
              </DropdownTrigger>
              <DropdownMenu onAction={(value) => setLimit(`${value}`)}>
                <DropdownItem key="10">10</DropdownItem>
                <DropdownItem key="20">20</DropdownItem>
                <DropdownItem key="30">30</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button
              type="submit"
              color="primary"
              isLoading={isSearchingNumbers}
            >
              Search
            </Button>
          </form>

          <div className="py-4 w-100 flex flex-wrap gap-3">
            {phoneNumbersResult.map((phoneNumber, i) => (
              <Card key={`phone_${i}`} className="max-w-[250px]">
                <CardHeader>{phoneNumber.friendlyName}</CardHeader>
                <CardBody>
                  <div className="text-base">
                    {phoneNumber.locality}, {phoneNumber.region}
                  </div>
                  <div className="flex gap-1">
                    {phoneNumber.capabilities.voice && (
                      <Chip size="xs">Voice</Chip>
                    )}

                    {(phoneNumber.capabilities as CustomCapabilities).SMS && (
                      <Chip size="xs">SMS</Chip>
                    )}
                    {(phoneNumber.capabilities as CustomCapabilities).MMS && (
                      <Chip size="xs">NMS</Chip>
                    )}
                    {phoneNumber.capabilities.fax && <Chip size="xs">Fax</Chip>}
                  </div>
                </CardBody>
              </Card>
            ))}

            {noResultsMessage}
          </div>
        </main>
      </div>
    </div>
  )
}
