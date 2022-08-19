import React, { useEffect, useState } from 'react'
import type { NextPage, GetServerSideProps } from 'next'
import Sidebar from 'components/Message/Sidebar'
import Button from 'components/UI/Button'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import MessageBox from 'components/Message/MessageBox'
import GraphQLAPI from '@aws-amplify/api-graphql'
import { listMessages } from 'graphql/amplify/queries'
import { Message, ListMessagesQuery } from "API"
import { CURRENT_USER_QUERY } from 'graphql/query/user'
import { useLazyQuery, useQuery } from '@apollo/client'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import getIPFSLink from 'utils/getIPFSLink'

interface Props {
    messages: Message[]
}


const ChatPage: NextPage<Props> = ({ messages }) => {
    const { address } = useAccount()
    const { query: { chatId } } = useRouter()
    const [peerAddress, setPeerAddress] = useState("")
    const [avatar, setAvatar] = useState("")
    const [name, setName] = useState("")
    const [handle, setHandle] = useState("")
    const updateProfile = async () => {
        const { data } = await getProfiles()
        setAvatar(data?.profiles?.items[0]?.picture?.original?.url)
        setName(data?.profiles?.items[0]?.name)
        setHandle(data?.profiles?.items[0]?.handle)
    }
    useEffect(() => {
        if (address && chatId?.includes('-')) {
            //@ts-ignore
            const list = chatId.split('-')
            const peer = list.find((item: string) => item !== address)
            setPeerAddress(peer)
            updateProfile()
        }
    }, [address, chatId])

    const [getProfiles, { error: errorProfiles, loading: profilesLoading }] =
        useLazyQuery(CURRENT_USER_QUERY,
            {
                variables: { ownedBy: [peerAddress] },
                onCompleted(data) {
                    console.log("[Lazy query completed]", data)
                    setAvatar(getIPFSLink(data?.profiles?.items[0]?.picture?.original?.url))
                    setName(data?.profiles?.items[0]?.name)
                    setHandle(data?.profiles?.items[0]?.handle)
                }
            })

    console.log("Peer address:", peerAddress)
    console.log("messages:", messages)

    return (
        <div className='grid grid-cols-3 w-full'>
            <div className='col-span-1 flex flex-col overflow-y-auto border border-transparent border-r-[#2F3336]'>
                <Sidebar />
            </div>
            <div className='col-span-2 flex'>
                <div className='w-full flex flex-col px-4'>
                    <div className='flex gap-2 items-center h-[53px]'>
                        <div>
                            {avatar && <img src={avatar} className='rounded-full w-8 h-8' />}
                            {!avatar && <div className="rounded-full loading w-8 h-8" />}

                        </div>
                        <div>
                            {name || handle && <><div className='font-bold text-[20px]'>{name}</div>
                                <div className='text-gray-400'>{handle}</div></>}
                            {!name && !handle && <div className="rounded-lg loading w-32 h-4" />}

                        </div>
                    </div>
                    <MessageBox messages={messages} conversationId={chatId as string} peerAddress={peerAddress} />
                </div>
            </div>
        </div>

    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { query: { chatId } } = context
    const { data } = await GraphQLAPI.graphql({
        query: listMessages,
        variables: {
            filter: {
                conversationId: {
                    eq: chatId
                }
            }
        }
    }) as { data: ListMessagesQuery }
    const messages = data?.listMessages?.items

    return {
        props: {
            messages
        }
    }
}
export default ChatPage