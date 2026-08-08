import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

function Settings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingQris, setUploadingQris] = useState(false);
  const [qrisFile, setQrisFile] = useState(null);
  const [qrisPreview, setQrisPreview] = useState(null);
  const [settings, setSettings] = useState({
    bank_account_number: '',
    bank_name: '',
    account_holder_name: '',
    target_amount: '0',
    qris_image_url: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchSettings();
  }, [navigate, user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      setSettings(response.data);
      if (response.data.qris_image_url) {
        setQrisPreview(`${import.meta.env.VITE_API_URL}${response.data.qris_image_url}`);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      await api.put('/settings', settings);
      
      toast.success('Pengaturan berhasil disimpan!');
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      const errorMsg = error.response?.data?.message || 'Gagal menyimpan pengaturan';
      toast.error(errorMsg);
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  const handleQrisFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Hanya file gambar yang diperbolehkan');
        return;
      }

      setQrisFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrisPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveQris = () => {
    setQrisFile(null);
    setQrisPreview(null);
  };

  const handleUploadQris = async () => {
    if (!qrisFile) {
      toast.error('Pilih file QRIS terlebih dahulu');
      return;
    }

    setUploadingQris(true);
    try {
      const formData = new FormData();
      formData.append('qris', qrisFile);

      const response = await api.post('/settings/qris', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(response.data.message);
      setSettings({
        ...settings,
        qris_image_url: response.data.qrisUrl
      });
      setQrisFile(null);
      
      await fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal upload QRIS');
    } finally {
      setUploadingQris(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan</h1>
        <p className="text-gray-600">Kelola informasi rekening bank untuk pembayaran</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Rekening Bank</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Bank
            </label>
            <input
              type="text"
              name="bank_name"
              value={settings.bank_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Bank BCA"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Rekening
            </label>
            <input
              type="text"
              name="bank_account_number"
              value={settings.bank_account_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: 1234567890"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Pemilik Rekening
            </label>
            <input
              type="text"
              name="account_holder_name"
              value={settings.account_holder_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Kas Dolan Bareng"
              required
            />
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Target Kas</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Uang (Opsional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  Rp
                </span>
                <input
                  type="number"
                  name="target_amount"
                  value={settings.target_amount}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Target uang yang ingin dikumpulkan. Akan ditampilkan di dashboard sebagai progress bar.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Upload QRIS</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload foto QRIS statis dari bank/e-wallet Anda untuk pembayaran
            </p>
            
            {!qrisPreview ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => document.getElementById('qris-upload').click()}
              >
                <FiUpload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Klik untuk upload gambar QRIS
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF (Max 5MB)
                </p>
                <input
                  id="qris-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleQrisFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img 
                    src={qrisPreview} 
                    alt="QRIS Preview" 
                    className="w-64 h-64 object-contain rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveQris}
                    className="absolute -top-2 -right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                
                {qrisFile && (
                  <button
                    type="button"
                    onClick={handleUploadQris}
                    disabled={uploadingQris}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploadingQris ? 'Mengupload...' : 'Simpan QRIS'}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
