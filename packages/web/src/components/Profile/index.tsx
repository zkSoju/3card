import React, { useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { PROFILE_QUERY } from 'graphql/query/profile'
import { useQuery } from '@apollo/client'
import { useAppSelector } from 'state/hooks'
import Button from 'components/UI/Button'
import { HiOutlineUserAdd } from "react-icons/hi";
import { FiMail } from "react-icons/fi";
import ProfileTabs from './ProfileTabs'
import Content from './Content'
import { current } from '@reduxjs/toolkit'
import NFTFeed from './NFTFeed'
type Props = {}
export enum TabType {
    POST = 'POST',
    COMMENT = 'COMMENT',
    MIRROR = 'MIRROR',
    NFT = 'NFT',
    ACTIVITIES = 'ACTIVITIES',
    RANKING = 'RANKING'
}
const tags = [
    "Uniswap V2 Trader",
    "Uniswap V3 LP",
    "Opensea Transaction maker"
]
const Profile: NextPage = (props: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
    const { query: { username } } = useRouter()
    const [currentTab, setCurrentTab] = useState<string>(TabType.POST)
    const { data, loading, error } = useQuery(PROFILE_QUERY, {
        variables: { request: { handle: username }, who: currentUser?.id ?? null },
        skip: !username,
        onCompleted(data) {
            console.log(data)
            console.log(
                '[Query]',
                `Fetched profile details Profile:${data?.profile?.id}`
            )
        },
        onError(error) {
            console.error('[Query Error]', error)
        }
    })
    const profile = data?.profile

    return (
        <div className='flex flex-col justify-start w-full'>
            <div className='h-52 sm:h-80 bg-black bg-opacity-50' style={{
                backgroundImage: `url(${profile?.coverPicture?.original?.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
            }} />

            <div className='grid grid-cols-3 '>
                <div className='col-span-1 h-full flex flex-col items-center -mt-24 gap-[10px] object-cover'>
                    <div className='h-[196px] w-[196px] '>
                        <img
                            className='ring-8 ring-black rounded-full bg-black object-center w-[196px] h-[196px] object-cover'
                            src={profile?.picture?.original?.url || profile?.picture?.uri}
                        />
                    </div>
                    <div className='flex flex-col justify-center items-start gap-[12px]'>
                        <div>
                            <div className='text-[20px]'>
                                {profile?.name}
                            </div>
                            <div className='text-gray-400'>
                                @{profile?.handle}
                            </div>
                        </div>
                        <div className='flex gap-[16px]'>
                            <div className='flex gap-[4px]'>
                                <div className='font-semibold'>
                                    {profile?.stats.totalFollowing}
                                </div>
                                <div className='text-gray-400'>
                                    Following
                                </div>
                            </div>
                            <div className='flex gap-[4px]'>
                                <div className='font-semibold'>
                                    {profile?.stats.totalFollowers}
                                </div>
                                <div className='text-gray-400'>
                                    Followers
                                </div>
                            </div>
                        </div>
                        <div className='flex gap-[10px] items-center justify-start'>
                            <button
                                className='flex justify-center items-center rounded-full px-4 py-2 text-black bg-[#eff3f4] font-semibold h-10 hover:bg-opacity-80'>
                                Follow
                            </button>
                            <button
                                className='flex justify-center items-center rounded-full border border-[#536471] w-10 h-10'
                            >
                                <FiMail className='text-[20px]' />
                            </button>

                        </div>
                        <div className='w-[200px] border-b border-[#536471] pb-[16px]'>
                            {profile?.bio}
                        </div>
                        <div className='w-[200px] flex flex-wrap gap-[10px] border-b border-[#536471] pb-[16px]'>
                            {tags.map((item, index) => (
                                <div className='px-2 py-1 bg-primary-blue bg-opacity-30 rounded-lg'>
                                    {item}
                                </div>
                            ))}
                        </div>
                        <div className='flex flex-col items-start'>
                            <div># {profile?.id}</div>
                            <div>ens</div>
                            {profile?.onChainIdentity?.ens?.name && <div>{profile?.onChainIdentity?.ens?.name}</div>}
                            <div>twitter</div>

                        </div>
                    </div>
                </div>
                <div className='col-span-2 flex flex-col'>
                    <ProfileTabs setCurrentTab={setCurrentTab} currentTab={currentTab} />
                    <div className='px-4 py-2 flex flex-col gap-2'>
                        {(currentTab === 'POST' ||
                            currentTab === 'COMMENT' ||
                            currentTab === 'MIRROR') && (
                                <Content profile={profile} currentTab={currentTab} />
                            )}
                        {currentTab === 'NFT' && (<NFTFeed profile={profile} />)}
                    </div>


                </div>
            </div>

        </div>
    )
}

export default Profile