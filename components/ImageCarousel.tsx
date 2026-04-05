'use client'

import { useState, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getProxyImageUrl } from '@/lib/utils'

interface ImageCarouselProps {
  images: string[]
  alt: string
}

export default function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useState(() => {
    if (emblaApi) {
      emblaApi.on('select', onSelect)
    }
  })

  if (!images || images.length === 0) {
    return (
      <div className="relative flex h-64 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 md:h-96">
        <p className="text-slate-400">Sem fotos disponíveis</p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map((img, index) => {
            const imageUrl = getProxyImageUrl(img)
            return (
              <div key={index} className="relative h-64 min-w-0 flex-[0_0_100%] md:h-96">
                {/^https?:\/\//.test(imageUrl) ? (
                  <img
                    src={imageUrl}
                    alt={`${alt} - Foto ${index + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={imageUrl}
                    alt={`${alt} - Foto ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5 text-slate-700" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition hover:bg-white"
          >
            <ChevronRight className="h-5 w-5 text-slate-700" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition ${
                  index === selectedIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
