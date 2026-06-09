"use client"

import Script from "next/script"
import { MessageCircle, UserPlus } from "lucide-react"
import { KAKAO_CHANNEL } from "@/config/kakao-channel"
import { cn } from "@/lib/utils"

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void
      isInitialized: () => boolean
      Channel: {
        chat: (opts: { channelPublicId: string }) => void
        addChannel: (opts: { channelPublicId: string }) => void
      }
    }
  }
}

const JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY

function initKakao() {
  if (JS_KEY && window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(JS_KEY)
  }
}

function openChat() {
  if (JS_KEY && window.Kakao?.isInitialized()) {
    window.Kakao.Channel.chat({ channelPublicId: KAKAO_CHANNEL.publicId })
    return
  }
  window.open(KAKAO_CHANNEL.chatUrl, "_blank", "noopener,noreferrer")
}

function addChannel() {
  if (JS_KEY && window.Kakao?.isInitialized()) {
    window.Kakao.Channel.addChannel({ channelPublicId: KAKAO_CHANNEL.publicId })
    return
  }
  window.open(KAKAO_CHANNEL.channelUrl, "_blank", "noopener,noreferrer")
}

type Props = {
  className?: string
  itemClassName?: string
}

export default function KakaoChannelActions({ className, itemClassName }: Props) {
  const itemCls = cn(
    "inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors",
    itemClassName
  )

  return (
    <>
      {JS_KEY && (
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          integrity="sha384-DKYJZ8NLiK8MN4/C5P0dNpAk8PZ8g1Cdm9c4dU/6UMDjGR2oHo6v7w/Xd0Cz0QZ"
          crossOrigin="anonymous"
          strategy="lazyOnload"
          onLoad={initKakao}
        />
      )}
      <div className={cn("flex flex-col gap-1.5", className)}>
        <button type="button" onClick={openChat} className={itemCls}>
          <MessageCircle className="w-3.5 h-3.5" />
          카카오톡 채팅
        </button>
        <button type="button" onClick={addChannel} className={itemCls}>
          <UserPlus className="w-3.5 h-3.5" />
          카카오톡 채널 추가
        </button>
      </div>
    </>
  )
}
