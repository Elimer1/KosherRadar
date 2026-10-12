export interface SubmissionRestaurant {
  id: string;
  name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
}

export interface SubmissionTeuda {
  id: string;
  restaurantName: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
  points: number;
}

export interface SubmissionReport {
  id: string;
  restaurantName: string | null;
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
  points: number;
}

export interface MySubmissions {
  restaurants: SubmissionRestaurant[];
  teudot: SubmissionTeuda[];
  reports: SubmissionReport[];
}
