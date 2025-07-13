import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Chrome, 
  Shield, 
  Users, 
  Zap
} from 'lucide-react';

export default function Authentication() {
  const { signIn } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const success = await signIn();
      if (!success) {
        alert('Gagal masuk. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Terjadi kesalahan saat masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Keamanan Terjamin',
      description: 'Data tersimpan aman di Google Sheets dengan enkripsi end-to-end'
    },
    {
      icon: Zap,
      title: 'Real-time Sync',
      description: 'Sinkronisasi data real-time dengan Google Workspace'
    },
    {
      icon: Users,
      title: 'Kolaborasi Tim',
      description: 'Berbagi akses dengan tim untuk mengelola stok bersama'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="min-h-screen flex">
        {/* Left Panel - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 bg-gradient-to-br from-blue-600 to-indigo-700">
          <div className="max-w-md">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-blue-600 text-xl font-bold">SM</span>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-white">StockManager</h1>
                <p className="text-blue-100">Digital Product Management</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-6">
              Kelola Stok Digital Anda dengan Mudah
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              Sistem manajemen stok dan penjualan produk digital yang terintegrasi dengan Google Sheets.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm text-blue-100">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Authentication */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="lg:hidden flex items-center justify-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold">SM</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Selamat Datang
              </h2>
              <p className="mt-3 text-gray-600">
                Masuk untuk mengakses dashboard manajemen stok
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {/* Google Login */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Login dengan Google
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Gunakan akun Google untuk akses ke data spreadsheet Anda
                  </p>
                </div>

                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-4 px-6 border border-gray-300 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : (
                    <>
                      <Chrome className="h-5 w-5 mr-3 text-gray-500 group-hover:text-gray-700" />
                      Masuk dengan Google
                    </>
                  )}
                </button>

                <div className="text-xs text-center text-gray-500">
                  Dengan masuk, Anda menyetujui penggunaan Google Sheets API untuk menyimpan data
                </div>
                
              </div>

              {/* Feature Highlights */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Aman</p>
                  </div>
                  <div>
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Zap className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Cepat</p>
                  </div>
                  <div>
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Kolaboratif</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Aplikasi ini menggunakan Google Sheets sebagai database.{' '}
                <a href="https://developers.google.com/workspace/sheets/api/quickstart/js" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-blue-600 hover:text-blue-700 underline">
                  Pelajari lebih lanjut
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
