import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course, CourseCategory, Difficulty } from '../../models/course/course.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  // Featured courses data
  featuredCourses: Course[] = [
    {
      id: '1',
      title: 'Complete Forex Trading Mastery',
      description: 'Master the foreign exchange market with comprehensive strategies, risk management, and technical analysis techniques used by professional traders.',
      shortDescription: 'Learn professional forex trading strategies from beginner to advanced level.',
      price: 299,
      currency: 'USD',
      difficulty: Difficulty.BEGINNER,
      duration: 40,
      instructor: {
        id: 'inst1',
        name: 'Michael Sterling',
        bio: 'Former Wall Street trader with 15+ years of forex experience',
        profileImage: '/assets/images/instructors/michael-sterling.svg',
        credentials: ['CFA', 'FRM', 'Former Goldman Sachs'],
        yearsExperience: 15
      },
      thumbnailUrl: '/assets/images/courses/forex-mastery.svg',
      previewVideoUrl: '/assets/videos/forex-preview.mp4',
      category: CourseCategory.FOREX,
      tags: ['forex', 'currency', 'technical-analysis', 'risk-management'],
      isPublished: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-01'),
      enrollmentCount: 2847,
      rating: 4.8,
      lessons: []
    },
    {
      id: '2',
      title: 'Stock Market Investment Strategies',
      description: 'Discover proven stock market strategies, fundamental analysis, and portfolio management techniques for long-term wealth building.',
      shortDescription: 'Build wealth through strategic stock market investing and portfolio management.',
      price: 249,
      currency: 'USD',
      difficulty: Difficulty.INTERMEDIATE,
      duration: 35,
      instructor: {
        id: 'inst2',
        name: 'Sarah Chen',
        bio: 'Portfolio Manager and CFA with expertise in equity analysis',
        profileImage: '/assets/images/instructors/sarah-chen.svg',
        credentials: ['CFA', 'MBA Finance', 'Portfolio Manager'],
        yearsExperience: 12
      },
      thumbnailUrl: '/assets/images/courses/stock-strategies.svg',
      category: CourseCategory.STOCKS,
      tags: ['stocks', 'investing', 'portfolio', 'fundamental-analysis'],
      isPublished: true,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-05'),
      enrollmentCount: 1923,
      rating: 4.7,
      lessons: []
    },
    {
      id: '3',
      title: 'Cryptocurrency Trading Bootcamp',
      description: 'Navigate the crypto markets with confidence using advanced trading strategies, DeFi protocols, and blockchain analysis.',
      shortDescription: 'Master cryptocurrency trading and blockchain technology fundamentals.',
      price: 199,
      currency: 'USD',
      difficulty: Difficulty.ADVANCED,
      duration: 25,
      instructor: {
        id: 'inst3',
        name: 'Alex Rodriguez',
        bio: 'Blockchain expert and crypto trader since 2017',
        profileImage: '/assets/images/instructors/alex-rodriguez.svg',
        credentials: ['Blockchain Certified', 'DeFi Specialist', 'Crypto Analyst'],
        yearsExperience: 7
      },
      thumbnailUrl: '/assets/images/courses/crypto-bootcamp.svg',
      category: CourseCategory.CRYPTOCURRENCY,
      tags: ['cryptocurrency', 'bitcoin', 'defi', 'blockchain'],
      isPublished: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-10'),
      enrollmentCount: 1456,
      rating: 4.9,
      lessons: []
    }
  ];

  // Testimonials data
  testimonials = [
    {
      id: 1,
      name: 'David Thompson',
      role: 'Day Trader',
      image: '/assets/images/testimonials/david-thompson.svg',
      content: 'Royal Trading Academy transformed my trading career. I went from losing money consistently to generating a 35% annual return. The risk management strategies alone were worth the investment.',
      rating: 5,
      profit: '+$127,000',
      timeframe: '18 months'
    },
    {
      id: 2,
      name: 'Jennifer Martinez',
      role: 'Forex Trader',
      image: '/assets/images/testimonials/jennifer-martinez.svg',
      content: 'The forex course gave me the confidence to trade professionally. The instructors are genuine experts who share real-world strategies that actually work in live markets.',
      rating: 5,
      profit: '+$89,500',
      timeframe: '12 months'
    },
    {
      id: 3,
      name: 'Robert Kim',
      role: 'Investment Manager',
      image: '/assets/images/testimonials/robert-kim.svg',
      content: 'As a portfolio manager, I thought I knew everything about trading. This academy taught me advanced techniques that improved my fund performance by 22% last year.',
      rating: 5,
      profit: '+$2.1M',
      timeframe: '24 months'
    }
  ];

  // Statistics data
  statistics = [
    {
      number: '15,000+',
      label: 'Students Enrolled',
      icon: 'users'
    },
    {
      number: '50+',
      label: 'Expert Courses',
      icon: 'courses'
    },
    {
      number: '94%',
      label: 'Success Rate',
      icon: 'success'
    },
    {
      number: '$2.5M+',
      label: 'Student Profits',
      icon: 'profits'
    }
  ];

  // About section data
  aboutInfo = {
    title: 'About Royal Trading Academy',
    description: 'Founded by industry veterans with over 50 years of combined trading experience, Royal Trading Academy is dedicated to transforming aspiring traders into profitable professionals.',
    founder: {
      name: 'Jonathan Royal',
      title: 'Founder & Chief Trading Officer',
      image: '/assets/images/team/jonathan-royal.svg',
      bio: 'Former hedge fund manager with 20+ years on Wall Street. Jonathan has trained over 10,000 traders and managed portfolios worth $500M+.',
      credentials: ['CFA', 'Former Goldman Sachs VP', 'Hedge Fund Manager']
    },
    achievements: [
      'Over 15,000 successful students worldwide',
      'Featured in Forbes, Bloomberg, and CNBC',
      'Average student ROI improvement of 340%',
      'Partnerships with major financial institutions'
    ]
  };

  getDifficultyLabel(difficulty: Difficulty): string {
    switch (difficulty) {
      case Difficulty.BEGINNER:
        return 'Beginner';
      case Difficulty.INTERMEDIATE:
        return 'Intermediate';
      case Difficulty.ADVANCED:
        return 'Advanced';
      default:
        return 'All Levels';
    }
  }

  getCategoryLabel(category: CourseCategory): string {
    switch (category) {
      case CourseCategory.FOREX:
        return 'Forex';
      case CourseCategory.STOCKS:
        return 'Stocks';
      case CourseCategory.CRYPTOCURRENCY:
        return 'Cryptocurrency';
      case CourseCategory.OPTIONS:
        return 'Options';
      case CourseCategory.DAY_TRADING:
        return 'Day Trading';
      case CourseCategory.TECHNICAL_ANALYSIS:
        return 'Technical Analysis';
      case CourseCategory.RISK_MANAGEMENT:
        return 'Risk Management';
      case CourseCategory.TRADING_PSYCHOLOGY:
        return 'Trading Psychology';
      default:
        return 'Trading';
    }
  }

  generateStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}