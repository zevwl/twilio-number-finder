import { NextResponse } from 'next/server'
import twilio from 'twilio'
import { LocalListInstanceOptions } from 'twilio/lib/rest/api/v2010/account/availablePhoneNumberCountry/local'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioClient = twilio(accountSid, authToken)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const areaCode = searchParams.get('areaCode')
  const ends = searchParams.get('ends')
  const limit = searchParams.get('limit')

  const options: LocalListInstanceOptions = {}

  if (areaCode) {
    options.areaCode = +areaCode
  }

  if (ends) {
    options.contains = ends.padStart(10, '*')
  }

  if (limit) {
    options.limit = +limit
  }

  const response = await twilioClient
    .availablePhoneNumbers('US')
    .local.list(options)

  return NextResponse.json(response)
}
