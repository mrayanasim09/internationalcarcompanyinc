"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { StarRating } from '@/components/star-rating'
import { Star, MapPin, User } from 'lucide-react'
import Image from 'next/image'

interface GoogleReview {
  author_name: string
  rating: number
  relative_time_description: string
  text: string
  profile_photo_url?: string
  author_url?: string
}

interface GoogleReviewsProps {
  placeId?: string
  maxReviews?: number
}

export function GoogleReviews({ placeId = "ChIJN1t_tDeuEmsRUsoyG83frY4", maxReviews = 6 }: GoogleReviewsProps) {
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        
        // TODO: Implement actual Google Places API integration
        // This requires setting up Google Places API with proper API key
        // For now, show a message that reviews will load from API
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // No reviews to show until API is configured
        setReviews([])
        setAverageRating(0)
        setTotalReviews(0)
        setError(null)
      } catch (err) {
        setError('Failed to load reviews')
        console.error('Error fetching Google reviews:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [placeId, maxReviews])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Google Reviews
          </h2>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="h-5 w-5 text-yellow-400" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full mr-3"></div>
                  <div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Google Reviews
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Google Reviews
        </h2>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Star className="h-6 w-6 text-yellow-400" />
          <span className="text-2xl font-bold text-foreground">{averageRating}</span>
          <span className="text-muted-foreground">({totalReviews} reviews)</span>
        </div>
        <p className="text-muted-foreground">
          See what our customers say about us on Google
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <Card key={index} className="bg-card/70 backdrop-blur border border-border rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {review.author_name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <StarRating rating={review.rating} size="sm" interactive={false} />
                      <span className="text-sm text-muted-foreground">
                        {review.relative_time_description}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Reviews Yet
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Reviews will appear here once customers leave feedback on Google.
              </p>
              <a
                href="https://www.google.com/maps/search/International+Car+Company+Inc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
              >
                <MapPin className="h-4 w-4" />
                <span>Leave a Review</span>
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-8">
        <a
          href="https://www.google.com/maps/search/International+Car+Company+Inc"
          target="_blank"
          rel="noopener noreferrer"
         className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          <MapPin className="h-4 w-4" />
          <span>View All Reviews on Google</span>
        </a>
      </div>
    </div>
  )
}
