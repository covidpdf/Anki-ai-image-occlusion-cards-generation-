import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, Upload, BookOpen, BarChart3, Users, Zap } from 'lucide-react'

export function HomePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          AI-Powered Image Occlusion
          <span className="block text-primary">Flashcard Generation</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your study materials into intelligent flashcards using AI. 
          Perfect for medical students, language learners, and visual learners.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Button size="lg">
            <Upload className="mr-2 h-5 w-5" />
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            <BookOpen className="mr-2 h-5 w-5" />
            Browse Decks
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="text-center">
          <CardHeader>
            <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle>AI-Powered</CardTitle>
            <CardDescription>
              Smart occlusion generation using advanced AI algorithms
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle>Easy Upload</CardTitle>
            <CardDescription>
              Simply drag and drop your images to get started
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle>Spaced Repetition</CardTitle>
            <CardDescription>
              Built-in spaced repetition for optimal learning
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle>Progress Tracking</CardTitle>
            <CardDescription>
              Monitor your learning progress and statistics
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle>Share & Collaborate</CardTitle>
            <CardDescription>
              Share decks with friends and study together
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle>Lightning Fast</CardTitle>
            <CardDescription>
              Quick processing and instant card generation
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Stats Section */}
      <Card className="bg-muted/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join Thousands of Learners</CardTitle>
          <CardDescription>
            See how our platform is helping students worldwide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">1M+</div>
              <div className="text-sm text-muted-foreground">Cards Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">4.9★</div>
              <div className="text-sm text-muted-foreground">User Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}