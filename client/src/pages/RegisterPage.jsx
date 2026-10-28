import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleOptions = [
  { id: 'DONOR', label: 'Food Donor', icon: '🍲', desc: 'Restaurant, caterer, or event' },
  { id: 'NGO', label: 'NGO / Charity', icon: '🏢', desc: 'Verified food distributor' },
  { id: 'SHELTER', label: 'Shelter Home', icon: '🏠', desc: 'Community care shelter' },
  { id: 'VOLUNTEER', label: 'Volunteer', icon: '🚴', desc: 'Pickup & delivery driver' }
];

const roleRedirects = {
  DONOR: '/donor/dashboard',
  NGO: '/ngo/dashboard',
  SHELTER: '/ngo/dashboard',
  VOLUNTEER: '/volunteer/dashboard'
};

const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const cityOptionsByState = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Rajahmundry'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'],
  'Chhattisgarh': ['Raipur', 'Bilaspur', 'Durg', 'Bhilai'],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  Haryana: ['Gurugram', 'Faridabad', 'Panipat', 'Hisar'],
  'Himachal Pradesh': ['Shimla', 'Mandi', 'Solan', 'Dharamshala'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'],
  Kerala: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  Manipur: ['Imphal', 'Thoubal', 'Kakching', 'Ukhrul'],
  Meghalaya: ['Shillong', 'Tura', 'Jowai', 'Nongpoh'],
  Mizoram: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung', 'Chümoukedima'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Puri', 'Sambalpur'],
  Punjab: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer'],
  Sikkim: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Secunderabad'],
  Tripura: ['Agartala', 'Udaipur', 'Khowai', 'Dharmanagar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Rishikesh', 'Haldwani'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol'],
  'Andaman and Nicobar Islands': ['Port Blair', 'Car Nicobar', 'Havelock Island', 'Neil Island'],
  Chandigarh: ['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Silvassa', 'Daman', 'Diu'],
  Delhi: ['New Delhi', 'Dwarka', 'Rohini', 'Karol Bagh'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla'],
  Ladakh: ['Leh', 'Kargil', 'Diskit', 'Padum'],
  Lakshadweep: ['Kavaratti', 'Agatti', 'Minicoy', 'Andrott'],
  Puducherry: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam']
};

const organizationTypeOptions = ['Public', 'Private'];

const organizationNamesByType = {
  Public: ['City Relief Kitchen', 'Green Plate Initiative', 'Community Nutrition Hub', 'Hope Food Bank', 'Raj Nagar Food Center'],
  Private: ['Spice Garden Restaurant', 'Sunrise Catering', 'Blue Lotus Foods', 'Fresh Table Kitchen', 'Nourish Meal Co.']
};

const areaOptionsByStateCity = {
  'Andhra Pradesh': {
    'Visakhapatnam': ['MVP Colony', 'Gajuwaka', 'Dwaraka Nagar', 'Marripalem'],
    'Vijayawada': ['Governorpet', 'Benz Circle', 'Patamata', 'Auto Nagar'],
    'Guntur': ['Brodipet', 'Arundelpet', 'Lakshmipuram', 'Sankar Nagar'],
    'Rajahmundry': ['Kovvur Road', 'Prakash Nagar', 'Rajamundry Town', 'Gokavaram Road']
  },
  'Arunachal Pradesh': {
    'Itanagar': ['Itanagar Township', 'Sector A', 'Sector B', 'Naharlagun'],
    'Naharlagun': ['Niti Vihar', 'Nahar Market', 'Lal Circle', 'Bali Kheti'],
    'Pasighat': ['Borigog', 'Mebo', 'Pasighat Town', 'Ruksin Road'],
    'Tawang': ['Main Market', 'Monastery Road', 'Tawang Town', 'Tseringang']
  },
  Assam: {
    'Guwahati': ['Paltan Bazaar', 'Ulubari', 'Beltola', 'Dispur'],
    'Silchar': ['Madhya Ghat', 'Tarapur', 'Station Road', 'Rangirkhari'],
    'Dibrugarh': ['A.T. Road', 'Banipur', 'Dibrugarh Town', 'Barbaruah'],
    'Jorhat': ['Sivasagar Road', 'Kachari', 'Tarajan', 'Brahmaputra']
  },
  Bihar: {
    'Patna': ['Boring Road', 'Kankarbagh', 'Anandpuri', 'Golambar'],
    'Gaya': ['Civil Lines', 'Laxmi Nagar', 'Dhanbad Road', 'Rajnagar'],
    'Muzaffarpur': ['Station Road', 'Motijheel', 'Dholi', 'Mithanpura'],
    'Bhagalpur': ['Nehru Nagar', 'Ghantaghar', 'Sultanganj', 'Tilkamanjhi']
  },
  'Chhattisgarh': {
    'Raipur': ['Civil Lines', 'Shankar Nagar', 'Amapali', 'Moudhapara'],
    'Bilaspur': ['Tifra', 'Moudhapara', 'Amarkantak Road', 'Gol Bazar'],
    'Durg': ['Bhilai Road', 'Station Road', 'Guru Ghasidas Nagar', 'Mendri'],
    'Bhilai': ['Supela', 'Newai', 'Amanaka', 'Ravindra Nagar']
  },
  Goa: {
    'Panaji': ['Campal', 'Miramar', 'Margao', 'Taleigao'],
    'Margao': ['Borda', 'Navelim', 'Cortalim', 'Varca'],
    'Vasco da Gama': ['Mormugao', 'Baina', 'Bogmalo', 'Dabolim'],
    'Mapusa': ['Mapusa Market', 'Parra', 'Calangute', 'Arpora']
  },
  Gujarat: {
    'Ahmedabad': ['Navrangpura', 'Satellite', 'Bopal', 'CG Road'],
    'Surat': ['Adajan', 'Athwa', 'Piplod', 'Udhna'],
    'Vadodara': ['Alkapuri', 'Makarpura', 'Manjalpur', 'Akota'],
    'Rajkot': ['University Road', 'Aji', 'Kalawad Road', 'Race Course']
  },
  Haryana: {
    'Gurugram': ['Cyber City', 'Sushant Lok', 'Sector 29', 'MG Road'],
    'Faridabad': ['NIT', 'Sector 15', 'Old Faridabad', 'Ballabgarh'],
    'Panipat': ['Model Town', 'Krishna Colony', 'Sector 11', 'Sadar Bazar'],
    'Hisar': ['Urban Estate', 'Model Town', 'Balsamand', 'Jhajjar Road']
  },
  'Himachal Pradesh': {
    'Shimla': ['Mall Road', 'Kasumpti', 'Boileauganj', 'Summer Hill'],
    'Mandi': ['Mandi Town', 'Bhootnath', 'Sundernagar', 'Dharampur'],
    'Solan': ['The Mall', 'Parwanoo', 'Kasauli Road', 'Yol'],
    'Dharamshala': ['McLeodganj', 'Lower Dharamsala', 'Naddi', 'Bhagsu']
  },
  Jharkhand: {
    'Ranchi': ['Hinoo', 'Doranda', 'Kankar', 'Kutchery'],
    'Jamshedpur': ['Bistupur', 'Adityapur', 'Sakchi', 'Sonari'],
    'Dhanbad': ['Bank More', 'Jharia', 'Kumardubi', 'Govindpur'],
    'Bokaro': ['Sector 4', 'Sector 9', 'City Centre', 'Chas']
  },
  Karnataka: {
    'Bengaluru': ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout'],
    'Mysuru': ['Vijayanagar', 'Jayalakshmipuram', 'Kuvempunagar', 'Srirangapatna'],
    'Hubballi': ['Unkal', 'Basaveshwar Nagar', 'Gokul Road', 'Old Hubli'],
    'Mangaluru': ['Kankanady', 'Kadri', 'Surathkal', 'Pumpwell']
  },
  Kerala: {
    'Thiruvananthapuram': ['Pattom', 'Vazhuthacaud', 'Kazhakuttam', 'Kowdiar'],
    'Kochi': ['Kakkanad', 'Ernakulam', 'Fort Kochi', 'Aluva'],
    'Kozhikode': ['West Hill', 'Feroke', 'Mavoor Road', 'Chevarambalam'],
    'Thrissur': ['Ayyanthole', 'Koorkenchery', 'Swaraj Round', 'Punkunnam']
  },
  'Madhya Pradesh': {
    'Bhopal': ['Arera Colony', 'MP Nagar', 'New Market', 'Kolar Road'],
    'Indore': ['Vijay Nagar', 'Rajwada', 'Palasia', 'Higuchi'],
    'Gwalior': ['Madhotal', 'City Centre', 'Thatipur', 'Lashkar'],
    'Jabalpur': ['Napier Town', 'Adhartal', 'Ghamapur', 'Madan Mahal']
  },
  Maharashtra: {
    'Mumbai': ['Andheri', 'Powai', 'Dadar', 'Chembur'],
    'Pune': ['Kharadi', 'Viman Nagar', 'Baner', 'Shivaji Nagar'],
    'Nagpur': ['Sadar', 'Dhantoli', 'Manish Nagar', 'Nandanvan'],
    'Nashik': ['College Road', 'CBS', 'Gangapur Road', 'Satpur']
  },
  Manipur: {
    'Imphal': ['Singjamei', 'Thangmeiband', 'Wangkhei', 'Khuman Lampak'],
    'Thoubal': ['Thoubal Town', 'Wangjing', 'Kakching', 'Heirok'],
    'Kakching': ['Kakching Ward 1', 'Makhong', 'Lairenjam', 'Kakching Main'],
    'Ukhrul': ['Ukhrul Town', 'Chingai', 'Jessami', 'Somdal']
  },
  Meghalaya: {
    'Shillong': ['Police Bazar', 'Laitumkhrah', 'Mawlai', 'Laban'],
    'Tura': ['Tura Town', 'Selsella', 'Dalu', 'Betasing'],
    'Jowai': ['Jowai Town', 'Mukhla', 'Umlong', 'Khliehriat'],
    'Nongpoh': ['Nongpoh Market', 'Nongstoin', 'Umkiang', 'Mawphlang']
  },
  Mizoram: {
    'Aizawl': ['Electric Veng', 'Dulte', 'Ramhlun', 'Khatla'],
    'Lunglei': ['Bawngkawn', 'Lunglei Town', 'Blue Pine', 'Hnahthial'],
    'Champhai': ['Town Area', 'Chawngte', 'Hnahthial', 'Republican'],
    'Serchhip': ['Serchhip Town', 'Ngopa', 'Mizoram', 'Lunglei Road']
  },
  Nagaland: {
    'Kohima': ['Lower Block', 'New Market', 'Sevülie', 'Chiechama'],
    'Dimapur': ['Station Road', 'Eden', 'Lalganj', 'P2'],
    'Mokokchung': ['Town Area', 'Aonglenden', 'Longkhum', 'Mopong'],
    'Chümoukedima': ['Chümoukedima Town', 'Phrie', 'Seithekema', 'Tuli']
  },
  Odisha: {
    'Bhubaneswar': ['Sahid Nagar', 'Patia', 'Khandagiri', 'Bapuji Nagar'],
    'Cuttack': ['Madhupatna', 'Madhusudan Nagar', 'Buxi Bazar', 'Adivasi Basti'],
    'Puri': ['Brahmagiri', 'Sea Beach', 'Raghurajpur', 'Kakatpur'],
    'Sambalpur': ['Sambalpur Town', 'Ainthapali', 'Burla', 'Laikera']
  },
  Punjab: {
    'Chandigarh': ['Sector 17', 'Sector 22', 'Manimajra', 'Madhya Marg'],
    'Ludhiana': ['Civil Lines', 'Model Town', 'Pakhowal Road', 'Miller Ganj'],
    'Amritsar': ['Ranjit Avenue', 'Hall Bazaar', 'Lawrence Road', 'Majitha Road'],
    'Jalandhar': ['Model Town', 'Basti Bawa Khel', 'Ladowali Road', 'Madhopur']
  },
  Rajasthan: {
    'Jaipur': ['Malviya Nagar', 'Vaishali Nagar', 'Sodala', 'Mansarovar'],
    'Jodhpur': ['Ratanada', 'Basni', 'Paota', 'BJS Colony'],
    'Udaipur': ['Hiran Magri', 'Madhuban', 'Sai Colony', 'Shastri Circle'],
    'Ajmer': ['Vaishali Nagar', 'Kishangarh', 'Gulzar Colony', 'Dargah Road']
  },
  Sikkim: {
    'Gangtok': ['M G Marg', 'Tadong', 'Deorali', 'Sichey'],
    'Namchi': ['Namchi Town', 'South Sikkim', 'Tendong', 'Ralong'],
    'Gyalshing': ['Gyalshing Market', 'Soreng', 'Aritar', 'Khamdong'],
    'Mangan': ['Mangan Town', 'Sakyong', 'Lungnak', 'Singtam']
  },
  'Tamil Nadu': {
    'Chennai': ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery'],
    'Coimbatore': ['RS Puram', 'Saibaba Colony', 'Peelamedu', 'Town Hall'],
    'Madurai': ['KK Nagar', 'West Masi Street', 'Periyar', 'Bypass Road'],
    'Salem': ['Shevapet', 'Mettur', 'Alagapuram', 'Sowcarpet']
  },
  Telangana: {
    'Hyderabad': ['Gachibowli', 'Madhapur', 'Banjara Hills', 'Secunderabad'],
    'Warangal': ['Hanamkonda', 'Rajeev Nagar', 'Ashoknagar', 'Kazipet'],
    'Nizamabad': ['Ravindra Nagar', 'Nizam College', 'Indiranagar', 'Police Lines'],
    'Secunderabad': ['Madhura Nagar', 'Trimulgherry', 'Sainikpuri', 'West Marredpally']
  },
  Tripura: {
    'Agartala': ['Maharani', 'Banamalipur', 'Dhaleswar', 'Kunjaban'],
    'Udaipur': ['Udaipur Town', 'Khowai', 'Teliamura', 'Kumarghat'],
    'Khowai': ['Khowai Town', 'Mungiakami', 'Teliamura', 'Kalyanpur'],
    'Dharmanagar': ['Dharmanagar Town', 'Kanchanpur', 'Ambassa', 'Kumarghat']
  },
  'Uttar Pradesh': {
    'Lucknow': ['Hazratganj', 'Aliganj', 'Indira Nagar', 'Aashiana'],
    'Kanpur': ['Shivala', 'Kidwai Nagar', 'Civil Lines', 'Moti Nagar'],
    'Varanasi': ['Assi', 'Bhelupur', 'Sigra', 'Lanka'],
    'Agra': ['Sikandra', 'Dayalbagh', 'Tajganj', 'Civil Lines']
  },
  Uttarakhand: {
    'Dehradun': ['Rajpur Road', 'Clement Town', 'Dalanwala', 'Vasant Vihar'],
    'Haridwar': ['Har Ki Pauri', 'Rishikesh Road', 'Bhagwanpur', 'Shivaji Colony'],
    'Rishikesh': ['Tapovan', 'Lakshman Jhula', 'Muni Ki Reti', 'Shivpuri'],
    'Haldwani': ['Lalkuan', 'Kathgodam', 'Bhimtal', 'Rampur']
  },
  'West Bengal': {
    'Kolkata': ['Salt Lake', 'Park Street', 'Howrah Bridge', 'Gariahat'],
    'Howrah': ['Liluah', 'Belur', 'Bally', 'Konnagar'],
    'Durgapur': ['City Centre', 'Rajarhat', 'Asansol Road', 'Sankrail'],
    'Asansol': ['Burnpur', 'Rupnarayanpur', 'Kulti', 'Madhabpur']
  },
  'Andaman and Nicobar Islands': {
    'Port Blair': ['Aberdeen Bazaar', 'Bharatpur', 'Junglighat', 'Shadipur'],
    'Car Nicobar': ['Car Nicobar Town', 'Nancowry', 'Kakana', 'Macy'],
    'Havelock Island': ['Beach Road', 'Govind Nagar', 'Radhanagar', 'Elephant Beach'],
    'Neil Island': ['Bharatpur', 'Laxmanpur', 'Sitapur', 'Neill Island']
  },
  Chandigarh: {
    'Chandigarh': ['Sector 17', 'Sector 22', 'Manimajra', 'Madhya Marg']
  },
  'Dadra and Nagar Haveli and Daman and Diu': {
    'Silvassa': ['Silvassa Town', 'Amli', 'Dharampur', 'Vapi Road'],
    'Daman': ['Moti Daman', 'Nani Daman', 'Kachigam', 'Jampore'],
    'Diu': ['Diu Town', 'Nagoa', 'Ghoghla', 'Vanakbara']
  },
  Delhi: {
    'New Delhi': ['Connaught Place', 'Dwarka Sector 8', 'Rohini Sector 14', 'Karol Bagh'],
    'Dwarka': ['Sector 6', 'Sector 12', 'Sector 17', 'Sector 21'],
    'Rohini': ['Sector 3', 'Sector 9', 'Sector 14', 'Sector 24'],
    'Karol Bagh': ['Pusa Road', 'Bajardi', 'Dev Nagar', 'Arya Samaj Road']
  },
  'Jammu and Kashmir': {
    'Srinagar': ['Lal Chowk', 'Rajbagh', 'Shaltang', 'Nigeen'],
    'Jammu': ['Gandhinagar', 'Trikuta Nagar', 'Bantalab', 'Muthi'],
    'Anantnag': ['Anantnag Town', 'Pahalgam Road', 'Bijbehara', 'Baba'],
    'Baramulla': ['Sopore', 'Uri', 'Wagoora', 'Tangmarg']
  },
  Ladakh: {
    'Leh': ['Main Market', 'Skara', 'Changspa', 'Khalsti'],
    'Kargil': ['Kargil Town', 'Drass', 'Sankoo', 'Zanskar'],
    'Diskit': ['Diskit Town', 'Saspol', 'Turtuk', 'Hunder'],
    'Padum': ['Padum Town', 'Zanskar', 'Penzila', 'Tingmosgang']
  },
  Lakshadweep: {
    'Kavaratti': ['Kavaratti Town', 'Andrott', 'Minicoy', 'Agatti'],
    'Agatti': ['Agatti Town', 'Bangaram', 'South Island', 'North Island'],
    'Minicoy': ['Minicoy Town', 'Mullin', 'Maharaja', 'West Island'],
    'Andrott': ['Andrott Town', 'West Andrott', 'East Andrott', 'Central Island']
  },
  Puducherry: {
    'Puducherry': ['White Town', 'Villianur', 'Lawspet', 'Ariyankuppam'],
    'Karaikal': ['Karaikal Town', 'T.R. Pattinam', 'Neravy', 'Sedar'],
    'Mahe': ['Mahe Town', 'Palloor', 'Ayankunnu', 'Chalakkara'],
    'Yanam': ['Yanam Town', 'Kothamangalam', 'Valluru', 'Konduru']
  }
};

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      role: 'DONOR',
      country: 'India',
      state: '',
      city: '',
      organization_type: 'Public',
      organization_name: ''
    }
  });

  const selectedRole = watch('role');
  const selectedState = watch('state');
  const selectedCity = watch('city');
  const selectedOrganizationType = watch('organization_type');
  const cityOptions = cityOptionsByState[selectedState] || [];
  const selectedCityAreas = selectedState && selectedCity ? areaOptionsByStateCity[selectedState]?.[selectedCity] || [] : [];
  const organizationNameOptions = organizationNamesByType[selectedOrganizationType] || [];

  const onSubmit = async (values) => {
    setServerError('');

    try {
      const user = await registerUser({ ...values });
      navigate(roleRedirects[user.role] || '/dashboard', { replace: true });
    } catch (error) {
      const data = error?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        setServerError(data.errors.map((e) => e.message).join(' • '));
      } else {
        setServerError(data?.message || error?.message || 'Unable to register account. Please check your network connection.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),transparent_26%),linear-gradient(180deg,#f8fffb_0%,#f3f7f4_100%)] text-slate-900 selection:bg-emerald-500 selection:text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid w-full gap-4 lg:grid-cols-[1.1fr_1.4fr] lg:items-stretch">
          <aside className="flex min-h-[520px] flex-col justify-between rounded-[32px] border border-emerald-100 bg-white/75 p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6 lg:p-8">
            <div>
              <Link to="/" className="inline-flex items-center gap-2.5 text-2xl font-black tracking-tight text-slate-900 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-transform duration-200 group-hover:scale-105">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span>Food<span className="text-emerald-600">Bridge</span></span>
              </Link>

              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                Join the network
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl">
                Create your account
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
                Join kitchens, shelters, and volunteers reducing food waste while delivering support to every neighborhood faster.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {[
                'Fast-track food donation listing',
                'Smart nearby discovery for charities',
                'Volunteer delivery coordination made simple'
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${
                    index === 0 ? 'bg-emerald-100 text-emerald-700' :
                    index === 1 ? 'bg-cyan-100 text-cyan-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="flex min-h-[520px] flex-col justify-center rounded-[32px] border border-slate-200 bg-white/85 p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6 lg:p-8 xl:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Your details</h2>
              <p className="mt-1 text-sm text-slate-500">Set up your account and start helping communities immediately.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Select your role
                </label>
                <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
                  {roleOptions.map((role) => {
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setValue('role', role.id)}
                        className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <span className="mb-1.5 text-xl">{role.icon}</span>
                        <span className={`text-xs font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {role.label}
                        </span>
                        <span className="mt-0.5 text-[10px] leading-tight text-slate-500">{role.desc}</span>
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" {...register('role', { required: true })} />
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label="Full name / representative" error={errors.name?.message}>
                  <input
                    className="input"
                    placeholder="e.g. Rahul Sharma"
                    {...register('name', { required: 'Full name is required' })}
                  />
                </Field>

                <Field label="Email address" error={errors.email?.message}>
                  <input
                    type="email"
                    className="input"
                    placeholder="name@organization.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address'
                      }
                    })}
                  />
                </Field>

                <Field label="Password" error={errors.password?.message}>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' }
                    })}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Organization type" error={errors.organization_type?.message}>
                    <select
                      className="input appearance-none"
                      {...register('organization_type', { required: 'Organization type is required' })}
                    >
                      {organizationTypeOptions.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field label="Organization / kitchen name" error={errors.organization_name?.message}>
                    <select
                      className="input appearance-none"
                      {...register('organization_name', { required: 'Organization name is required' })}
                    >
                      <option value="">Select {selectedOrganizationType.toLowerCase()} organization</option>
                      {organizationNameOptions.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field label="Street address / area" error={errors.address?.message}>
                    <select
                      className="input appearance-none disabled:cursor-not-allowed disabled:bg-slate-100"
                      disabled={!selectedCity || selectedCityAreas.length === 0}
                      {...register('address', { required: 'Address is required' })}
                    >
                      <option value="">{selectedCity ? 'Select area' : 'Select a city first'}</option>
                      {selectedCityAreas.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="State" error={errors.state?.message}>
                  <select
                    className="input appearance-none"
                    {...register('state', { required: 'State is required' })}
                  >
                    <option value="">Select state</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </Field>

                <Field label="City" error={errors.city?.message}>
                  <select
                    className="input appearance-none disabled:cursor-not-allowed disabled:bg-slate-100"
                    disabled={!selectedState || cityOptions.length === 0}
                    {...register('city', { required: 'City is required' })}
                  >
                    <option value="">{selectedState ? 'Select city' : 'Select a state first'}</option>
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {serverError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60 disabled:pointer-events-none"
              >
                {isSubmitting ? 'Creating your account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
