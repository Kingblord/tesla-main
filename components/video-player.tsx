"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Users } from "lucide-react"

interface VideoPlayerProps {
  video: {
    id: number
    title: string
    description: string
    duration: string
    views: string
    videoUrl: string
    thumbnail: string
    topics: string[]
    category: string
  }
  onClose: () => void
}

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // Convert YouTube watch URLs to embed URLs
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`
    }
    return url
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-700 max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{video.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {video.duration}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {video.views} views
              </div>
              <Badge className="bg-red-600">{video.category}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            ✕
          </Button>
        </div>

        <CardContent className="p-0">
          <div className="aspect-video bg-black">
            <iframe
              src={getEmbedUrl(video.videoUrl)}
              title={video.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="p-6">
            <p className="text-gray-300 mb-4 leading-relaxed">{video.description}</p>

            <div className="mb-4">
              <h4 className="text-white font-semibold mb-2">Topics Covered:</h4>
              <div className="flex flex-wrap gap-2">
                {video.topics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="bg-red-600 hover:bg-red-700">
                <Play className="h-4 w-4 mr-2" />
                Restart Video
              </Button>
              <Button variant="outline" className="border-gray-600">
                Next Tutorial
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
