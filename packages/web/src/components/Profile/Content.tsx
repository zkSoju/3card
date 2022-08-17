import { PROFILE_FEED_QUERY } from 'graphql/query/posts'
import React, { useState } from 'react'
import { PaginatedResultInfo, Profile, Post, Comment, Mirror, MediaSet, NftImage } from 'generated/types'
import { useQuery } from '@apollo/client'
import { useAppSelector } from 'state/hooks'
import PostHeader from './PostHeader'
import PostBody from './PostBody'
import InfiniteScroll from 'react-infinite-scroll-component'
import ProfileLoading from './ProfileLoading'
import { HiOutlineHeart, HiOutlineSwitchHorizontal, } from "react-icons/hi";
import { Spinner } from 'components/UI/Spinner'
import Link from 'next/link'

interface Props {
    currentTab: string
    profile: Profile
}
export type Publication = Post & Mirror & Comment

const Content = ({ currentTab, profile }: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
    const [publications, setPublications] = useState<Publication[]>([])
    const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
    const { data, loading, error, fetchMore } = useQuery(PROFILE_FEED_QUERY, {
        variables: {
            request: { publicationTypes: currentTab, profileId: profile?.id, limit: 10 },
            reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
            profileId: currentUser?.id ?? null
        },
        skip: !profile?.id,
        fetchPolicy: 'no-cache',
        errorPolicy: "all",
        onCompleted(data) {
            setPageInfo(data?.publications?.pageInfo)
            setPublications(data?.publications?.items)
            console.log(
                '[Query]',
                `Fetched first 10 profile publications Profile:${profile?.id}`
            )
        },
        onError(error) {
            console.error('[Query Error]', error)
        }
    })
    const fetchMoreData = async () => {
        fetchMore({
            variables: {
                request: { publicationTypes: currentTab, cursor: pageInfo?.next, profileId: profile?.id, limit: 10 },
                reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
                profileId: currentUser?.id ?? null
            }
        }).then(({ data }) => {
            console.log("[Query Result]: ", data)
            setPageInfo(data?.publications?.pageInfo)
            setPublications([...publications, ...data?.publications?.items])
        }).catch(err => {
            console.log('[Query Error]', err)
        })
    }
    console.log(publications)
    console.log(error)
    return (
        <>
            {loading && <ProfileLoading />}
            {!loading && data?.publications?.items?.length !== 0 && (
                <InfiniteScroll
                    dataLength={publications.length}
                    next={fetchMoreData}
                    loader={<div className='flex justify-center'><Spinner size='md' /></div>}
                    hasMore={pageInfo?.next && pageInfo?.totalCount && publications.length !== pageInfo?.totalCount}
                    scrollableTarget="scrollableDiv"
                    className='no-scrollbar'
                >
                    {publications.map((post, index) => (
                        <div className='flex flex-col border-b border-border-gray pt-4' key={index}>
                            {currentTab === "MIRROR" &&
                                <div className='flex items-center pb-4 gap-2 text-gray-400 font-bold'>
                                    <HiOutlineSwitchHorizontal />
                                    <div> {profile.name} mirrored {post.mirrorOf?.profile?.name}&apos;s post</div>
                                </div>}
                            {currentTab === "COMMENT" &&
                                //@ts-ignore
                                <Link href={`/post/${post?.commentOn?.pubId}`}>
                                    <div className='flex gap-[10px]'>
                                        <PostHeader profile={post?.commentOn?.profile as Profile & { picture: MediaSet & NftImage }} comment />
                                        <PostBody post={post?.commentOn as Publication} />
                                    </div>
                                </Link>
                            }
                            <Link href={currentTab === "MIRROR" ? `/post/${post?.mirrorOf?.id}` : `/post/${post?.id}`}>
                                <div className='flex gap-[10px]'>
                                    {currentTab !== "MIRROR" && <PostHeader profile={post?.profile as Profile & { picture: MediaSet & NftImage }} />}
                                    {currentTab === "MIRROR" && <PostHeader profile={post?.mirrorOf.profile as Profile & { picture: MediaSet & NftImage }} />}
                                    <PostBody post={post} mirror={currentTab === "MIRROR"} />
                                </div>
                            </Link>
                        </div>
                    ))}
                </InfiniteScroll>
            )}
            {!error && !loading && data?.publications?.items?.length == 0 &&
                <div>
                    No {currentTab.charAt(0) + currentTab.slice(1).toLowerCase()} yet
                </div>}
        </>

    )
}

export default Content