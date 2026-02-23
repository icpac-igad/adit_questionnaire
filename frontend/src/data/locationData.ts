import { LocationData } from '../types/form.types';

export const locationData: Record<string, LocationData> = {
  kenya: {
    regions: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Machakos', 'Meru', 'Kakamega', 'Kisii'],
    towns: {
      'Nairobi': ['Westlands', 'Kilimani', 'Lavington', 'Karen', 'Kasarani'],
      'Mombasa': ['Nyali', 'Bamburi', 'Shanzu', 'Mtwapa', 'Diani'],
      'Kisumu': ['Milimani', 'Nyalenda', 'Kondele', 'Kisian'],
      'Nakuru': ['Lanet', 'Molo', 'Naivasha', 'Gilgil'],
      'Eldoret': ['Langas', 'Huruma', 'Kapsoya', 'Chepkoilel'],
      'Thika': ['Makongeni', 'Hospital', 'Kimathi', 'Section 4'],
      'Machakos': ['Town Center', 'Mulu Mutisya', 'Kangundo', 'Kathiani'],
      'Meru': ['Town Center', 'Makutano', 'Kiirua', 'Muringene'],
      'Kakamega': ['Town Center', 'Shinyalu', 'Lugari', 'Malava'],
      'Kisii': ['Town Center', 'Keroka', 'Nyamarambe', 'Getenga']
    }
  },
  uganda: {
    regions: ['Kampala', 'Gulu', 'Lira', 'Mbale', 'Jinja', 'Mbarara', 'Arua', 'Masaka', 'Mukono', 'Kabale'],
    towns: {
      'Kampala': ['Kisimenti', 'Kololo', 'Nakasero', 'Old Kampala', 'Makindye'],
      'Gulu': ['Town Center', 'Laroo', 'Kasubi', 'Pece'],
      'Lira': ['Town Center', 'Adyel', 'Barogole', 'Railway'],
      'Mbale': ['Town Center', 'Nkoma', 'Kireka', 'Manafwa'],
      'Jinja': ['Town Center', 'Buwenge', 'Buyengo', 'Bugiri'],
      'Mbarara': ['Town Center', 'Kakyeka', 'Rwizi', 'Kyamuhunga'],
      'Arua': ['Town Center', 'Oli River', 'Oluko', 'Midigo'],
      'Masaka': ['Town Center', 'Kyotera', 'Bukakata', 'Lubigi'],
      'Mukono': ['Town Center', 'Ntinda', 'Seeta', 'Kazimba'],
      'Kabale': ['Town Center', 'Rushaki', 'Bukinda', 'Rubaya']
    }
  },
  sudan: {
    regions: ['Khartoum', 'Kassala', 'Port Sudan', 'Al-Fashir', 'Nyala', 'El Obeid', 'Kadugli', 'Damazin', 'Gedaref', 'Sennar'],
    towns: {
      'Khartoum': ['Bahri', 'Khartoum North', 'Omdurman', 'Khartoum Center'],
      'Kassala': ['Town Center', 'New Halfa', 'Telkuk', 'Hamashkoreeb'],
      'Port Sudan': ['Town Center', 'Suakin', 'Sinkat', 'Arous'],
      'Al-Fashir': ['Town Center', 'Kutum', 'Kabkabiya', 'Saraf Omra'],
      'Nyala': ['Town Center', 'El Geneina', 'Zalingei', 'Habila'],
      'El Obeid': ['Town Center', 'Kurta', 'Um Rawaba', 'Bara'],
      'Kadugli': ['Town Center', 'Rashad', 'Dilling', 'Talodi'],
      'Damazin': ['Town Center', 'Roseires', 'Ad Dindar', 'Kurmuk'],
      'Gedaref': ['Town Center', 'Galabat', 'Basunda', 'Fashaga'],
      'Sennar': ['Town Center', 'Singa', 'Dinder', 'Abu Hujar']
    }
  },
  djibouti: {
    regions: ['Djibouti City', 'Ali Sabieh', 'Dikhil', 'Tadjourah', 'Obock', 'Arta', 'Balbala'],
    towns: {
      'Djibouti City': ['Boulaos', 'Ambouli', 'Baragueira', 'Harbour', 'Plateau'],
      'Ali Sabieh': ['Town Center', 'As Eyla', 'Guisti', 'Hol Hol'],
      'Dikhil': ['Town Center', 'As Ela', 'Ghoubbet', 'Galafi'],
      'Tadjourah': ['Town Center', 'Obock', 'Godoria', 'Dorra'],
      'Obock': ['Town Center', 'Khor-Angar', 'Goubakh', 'Bir-Kambo'],
      'Arta': ['Town Center', 'Dorra', 'Godoria', 'Tadjourah'],
      'Balbala': ['Town Center', 'Passport', 'Aeroport', 'Caravane']
    }
  }
};

export const countries = [
  { value: 'kenya', label: 'Kenya' },
  { value: 'uganda', label: 'Uganda' },
  { value: 'sudan', label: 'Sudan' },
  { value: 'djibouti', label: 'Djibouti' },
] as const;

