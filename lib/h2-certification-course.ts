import type { CourseLesson } from './course-lesson'

export type CertificationLesson = CourseLesson

export const H2_CERTIFICATION_COURSE_SLUG = 'h2-aircraft-certification'

export const h2CertificationLessons: CertificationLesson[] = [
  {
    id: '1a',
    title: 'Lecture 1a: Overview of the H2 Aircraft Certification Course',
    videoUrl: 'https://www.youtube.com/embed/myMWfHsr39k',
    slidesUrl: 'https://drive.google.com/file/d/1aje70g7daQQEeFTsNe2_RLHQCmBpUjRb/view',
  },
  {
    id: '1b',
    title: 'Lecture 1b: Intro to Regulations and Standards Developments with Focus on US Regulations',
    videoUrl: 'https://www.youtube.com/embed/YnIu2NHQK-s',
    slidesUrl: 'https://drive.google.com/file/d/1YZLAtexpB98RDyE8LgQLDgYrIZmtqTMR/view',
  },
  {
    id: '2',
    title: 'Lecture 2: Certification of Electric and Fuel Cell Propulsion Systems',
    videoUrl: 'https://www.youtube.com/embed/Gbca7qfNKtc',
    slidesUrl: 'https://drive.google.com/file/d/1oXEC0SuT2uXNqOXx0CkSWdfA3FyGdUQZ/view',
  },
  {
    id: '3a',
    title: 'Lecture3a: Certification Foundations and Regulatory Framework (Focus on Canadian Regulations)',
    videoUrl: 'https://www.youtube.com/embed/5ct466ooJKw',
    slidesUrl: 'https://drive.google.com/file/d/1YksbvU6LrbdrKxi58hu_W3I-E59wo2Mw/view',
  },
  {
    id: '3b',
    title: 'Lecture 3b: Introduction to Hydrogen Storage and Fuel Supply on Aircraft',
    videoUrl: 'https://www.youtube.com/embed/6rN7USthQtI',
    slidesUrl: 'https://drive.google.com/file/d/1iG4nhn-YkTgHq8wWWGkRsxib4A0jmcWg/view',
  },
  {
    id: '4',
    title: 'Lecture 4: Ground Handling and Operational Certification',
    videoUrl: 'https://www.youtube.com/embed/9iOxDcd-u78',
    slidesUrl: 'https://drive.google.com/file/d/1HSVeNDp1ZzUVmzctiWh6yx8Sz_xXb8cl/view',
  },
  {
    id: '5',
    title: 'Lecture 5: Policy, Continuous Airworthiness, and MRO Challenges for Hydrogen Aviation Fuel',
    videoUrl: 'https://www.youtube.com/embed/wdaA59iiA08',
    slidesUrl: 'https://drive.google.com/file/d/1RQijkd95FY2ZfufYHK6WKOKT9UI6HFzf/view',
  },
  {
    id: '6',
    title: 'Lecture 6: Standardization & Future Policy Directions for Hydrogen in Aviation',
    videoUrl: 'https://www.youtube.com/embed/AlQKadS8I04',
    slidesUrl: 'https://drive.google.com/file/d/1g_xjpFn4UMi6rbKUNdEvQ2BKxas5QOt8/view',
  },
]
