import { useState, useEffect } from 'react';
import { PlusIcon, CheckIcon, XMarkIcon, CurrencyDollarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import GoogleSheetsService from '../services/GoogleSheetsService';
import { formatWIBDate, getWIBTimestamp, parseWIBTimestamp } from '../utils/dateWIB';

interface DebtRecord {
  id: string;
  contactId: string;
  contactName: string;
  contactType: 'customer' | 'supplier';
  type: 'money' | 'product';
  description: string;
  amount?: number;
  productId?: string;
  productName?: string;
  quantity?: number;
  status: 'pending' | 'partial' | 'completed';
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface Contact {
  id: string;
  name: string;
  type: 'customer' | 'supplier';
  phone?: string; // Added for WhatsApp feature
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  cost: number;
}

interface Payment {
  id: string;
  debtId: string;
  type: string;
  amount: number;
  quantity: number;
  paymentDate: string;
  notes: string;
  createdAt: string;
}

const Debts = () => {
  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // Guard untuk mencegah double submit
  const [showForm, setShowForm] = useState(false);
  const [showBulkPaymentForm, setShowBulkPaymentForm] = useState(false);
  // Removed bulkPaymentMode - HANYA MODE TERIMA
  const [filter] = useState<'all' | 'customer' | 'supplier'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'partial' | 'completed'>('all');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'list'>('summary');
  const [sortBy, setSortBy] = useState<'lastDebtTime' | 'netBalance' | 'contactName' | 'lastPaymentDate' | 'debtCount'>('lastDebtTime');

  // Modal state for modern UI notifications
  const [modalState, setModalState] = useState<{
    show: boolean;
    type: 'confirm' | 'alert' | 'success' | 'error';
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    show: false,
    type: 'alert',
    title: '',
    message: ''
  });

  const [formData, setFormData] = useState({
    contactId: '',
    type: 'money' as 'money' | 'product',
    amount: '',
    productId: '',
    quantity: '',
    dueDate: '',
    notes: ''
  });

  const [bulkPaymentData, setBulkPaymentData] = useState({
    customerName: '',
    paymentType: 'money' as 'money' | 'product' | 'mixed',
    moneyAmount: '',
    productId: '',
    productQuantity: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Modal helper functions
  const showConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal'
  ) => {
    setModalState({
      show: true,
      type: 'confirm',
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      onCancel: () => setModalState(prev => ({ ...prev, show: false }))
    });
  };

  const showAlertModal = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'alert' = 'alert'
  ) => {
    // Tutup modal sebelumnya jika ada
    if (modalState.show) {
      console.log('[DEBUG MODAL] Closing previous modal before showing new one');
      setModalState(prev => ({ ...prev, show: false }));
      
      // Tunggu sebentar untuk modal sebelumnya tertutup
      setTimeout(() => {
        setModalState({
          show: true,
          type,
          title,
          message,
          confirmText: 'OK',
          onConfirm: () => setModalState(prev => ({ ...prev, show: false }))
        });
      }, 100);
    } else {
      setModalState({
        show: true,
        type,
        title,
        message,
        confirmText: 'OK',
        onConfirm: () => setModalState(prev => ({ ...prev, show: false }))
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // WhatsApp helper function untuk ringkasan kontak
  const sendWhatsAppMessage = (contactName: string, phone: string, summary: any) => {
    if (!phone) {
      showAlertModal('Error', `Nomor WhatsApp tidak tersedia untuk ${contactName}. Silakan tambahkan nomor di data kontak.`, 'error');
      return;
    }

    const phoneNumber = phone.replace(/\D/g, ''); // Remove non-digits
    if (!phoneNumber) {
      showAlertModal('Error', 'Format nomor WhatsApp tidak valid', 'error');
      return;
    }

    let message = `Halo ${contactName},\n\n`;
    
    // Cek apakah customer memiliki hutang atau titip uang
    if (summary.netBalance > 0) {
      // Customer memiliki hutang bersih
      message += `Kami mengingatkan bahwa Anda memiliki hutang bersih sebesar ${formatCurrency(summary.netBalance)}.\n\n`;
      message += `Rincian:\n`;
      message += `- Total hutang: ${formatCurrency(summary.totalDebt)}\n`;
      if (summary.titipUang > 0) {
        message += `- Saldo titip uang: ${formatCurrency(summary.titipUang)}\n`;
      }
      if (summary.titipBarang > 0) {
        message += `- Nilai titip barang: ${formatCurrency(summary.titipBarang)}\n`;
      }
      message += `- Hutang bersih: ${formatCurrency(summary.netBalance)}\n\n`;
      message += `Mohon untuk melakukan pembayaran secepatnya atau hubungi kami untuk membahas jadwal pembayaran.\n\n`;
    } else if (summary.netBalance < 0) {
      // Customer memiliki saldo kredit (titip uang berlebih)
      const creditAmount = Math.abs(summary.netBalance);
      message += `Kami ingin menginformasikan bahwa Anda memiliki saldo kredit sebesar ${formatCurrency(creditAmount)} di toko kami.\n\n`;
      message += `Saldo ini dapat digunakan untuk:\n`;
      message += `- Pembayaran hutang berikutnya\n`;
      message += `- Pembelian barang\n`;
      message += `- Dapat diambil kembali kapan saja\n\n`;
      message += `Silakan hubungi kami jika ingin menggunakan atau mengambil saldo tersebut.\n\n`;
    } else {
      // Customer lunas
      message += `Terima kasih! Status hutang Anda saat ini: LUNAS ✓\n\n`;
      message += `Kami menghargai kepercayaan dan kerjasama Anda.\n\n`;
    }
    
    message += `Terima kasih atas perhatiannya.\n\n`;
    message += `- Tim Stock Manager`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(waUrl, '_blank');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load data sequentially with delays to avoid rate limiting
      console.log('[DEBUG LOAD] Loading debts...');
      await loadDebts();
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      
      console.log('[DEBUG LOAD] Loading contacts...');
      await loadContacts();
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      
      console.log('[DEBUG LOAD] Loading products...');
      await loadProducts();
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      
      console.log('[DEBUG LOAD] Loading payments...');
      await loadPayments();
      
      // Auto-update StatusHutang setelah data ter-load (run in background)
      console.log('[DEBUG LOAD] Starting auto-update StatusHutang after data load...');
      autoUpdateStatusHutang(false).then(() => {
        console.log('[DEBUG LOAD] Auto-update StatusHutang completed after data load');
      }).catch(error => {
        console.error('[DEBUG LOAD] Error in auto-update StatusHutang after data load:', error);
      });
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDebts = async () => {
    try {
      console.log('[DEBUG LOAD] Loading debts from Google Sheets...');
      const response = await GoogleSheetsService.getSheetData('Debts');
      console.log('[DEBUG LOAD] Debts response:', response);
      
      if (response.success && response.data) {
        const debtsData = response.data.map((row: string[], index: number) => ({
          id: row[0] || `debt_${index + 1}`,
          contactId: row[1] || '',
          contactName: row[2] || '',
          contactType: (row[3] || 'customer') as 'customer' | 'supplier',
          type: (row[4] || 'money') as 'money' | 'product',
          description: row[5] || '',
          amount: row[6] ? parseFloat(row[6]) : 0,
          productId: row[7] || '',
          productName: row[8] || '',
          quantity: row[9] ? parseInt(row[9]) : 0,
          status: (row[10] || 'pending') as 'pending' | 'partial' | 'completed',
          totalAmount: row[11] ? parseFloat(row[11]) : 0,
          paidAmount: row[12] ? parseFloat(row[12]) : 0,
          remainingAmount: row[13] ? parseFloat(row[13]) : 0,
          dueDate: row[14] || '',
          createdAt: row[15] ? row[15] : getWIBTimestamp(),
          updatedAt: row[16] ? row[16] : getWIBTimestamp(),
          notes: row[17] || ''
        }));
        
        console.log('[DEBUG LOAD] Processed debts data:', debtsData.length, 'records');
        console.log('[DEBUG LOAD] First 3 debt records:', debtsData.slice(0, 3));
        
        // Debug khusus untuk updatedAt field
        debtsData.forEach((debt, index) => {
          if (index < 5 && response.data) { // Log 5 record pertama untuk debug
            console.log(`[DEBUG LOAD] Debt ${index + 1}:`, {
              id: debt.id,
              contactName: debt.contactName,
              createdAt: debt.createdAt,
              updatedAt: debt.updatedAt,
              rawCreatedAt: response.data[index] ? response.data[index][15] : 'N/A', // Raw data from sheet
              rawUpdatedAt: response.data[index] ? response.data[index][16] : 'N/A', // Raw data from sheet
              description: debt.description
            });
          }
        });
        
        setDebts(debtsData);
      }
    } catch (error) {
      console.error('Error loading debts:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await GoogleSheetsService.getSheetData('Contacts');
      
      if (response.success && response.data) {
        const contactsData = response.data.map((row: string[]) => {
          return {
            id: row[0] || '',
            name: row[1] || '',
            type: (row[2] || 'customer') as 'customer' | 'supplier',
            phone: row[4] || '' // Phone dari kolom E (index 4)
          };
        });
        
        setContacts(contactsData);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await GoogleSheetsService.getSheetData('Products');
      if (response.success && response.data) {
        const productsData = response.data.map((row: string[]) => ({
          id: row[0] || '',
          name: row[1] || '',
          category: row[2] || '',
          price: row[3] ? parseFloat(row[3]) : 0,
          stock: row[4] ? parseInt(row[4]) : 0,
          cost: row[5] ? parseFloat(row[5]) : 0,
          minStock: row[6] ? parseInt(row[6]) : 0
        }));
        console.log(`[DEBUG PRODUCTS] Loaded ${productsData.length} products:`, productsData);
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadPayments = async () => {
    try {
      const response = await GoogleSheetsService.getSheetData('DebtPayments');
      if (response.success && response.data) {
        const paymentsData = response.data.map((row: string[]) => ({
          id: row[0] || '',
          debtId: row[1] || '',
          type: row[2] || '',
          amount: row[3] ? parseFloat(row[3]) : 0,
          quantity: row[4] ? parseFloat(row[4]) : 0,
          paymentDate: row[5] || '',
          notes: row[6] || '',
          createdAt: row[7] || ''
        }));
        console.log(`[DEBUG PAYMENTS] Loaded ${paymentsData.length} payments:`, paymentsData);
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      contactId: '',
      type: 'money',
      amount: '',
      productId: '',
      quantity: '',
      dueDate: '',
      notes: ''
    });
  };

  // Update amount when product or quantity changes
  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    setFormData(prev => ({
      ...prev,
      productId,
      amount: selectedProduct && prev.quantity ? 
        (selectedProduct.price * parseInt(prev.quantity)).toString() : prev.amount
    }));
  };

  const handleQuantityChange = (quantity: string) => {
    const selectedProduct = products.find(p => p.id === formData.productId);
    setFormData(prev => ({
      ...prev,
      quantity,
      amount: selectedProduct && quantity ? 
        (selectedProduct.price * parseInt(quantity)).toString() : prev.amount
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (submitting || loading) {
      console.log('[DEBUG] Submission blocked - already processing');
      return;
    }
    
    if (!formData.contactId || !formData.amount) {
      showAlertModal('Error', 'Mohon lengkapi semua field yang diperlukan!', 'error');
      return;
    }

    try {
      setSubmitting(true);
      setLoading(true);
      
      console.log('[DEBUG SUBMIT] Starting form submission...');
      
      const now = getWIBTimestamp();
      const selectedContact = contacts.find(c => c.id === formData.contactId);
      
      if (!selectedContact) {
        showAlertModal('Error', 'Contact tidak ditemukan!', 'error');
        setSubmitting(false);
        setLoading(false);
        return;
      }

      // Generate automatic description if notes is empty
      let description = formData.notes;
      if (!description || description.trim() === '') {
        if (formData.type === 'money') {
          description = `Hutang uang ${selectedContact.name} sebesar ${formatCurrency(parseFloat(formData.amount))}`;
        } else {
          const selectedProduct = products.find(p => p.id === formData.productId);
          if (selectedProduct && formData.quantity) {
            description = `Hutang barang ${selectedProduct.name} ${formData.quantity} pcs untuk ${selectedContact.name}`;
          } else {
            description = `Hutang barang senilai ${formatCurrency(parseFloat(formData.amount))} untuk ${selectedContact.name}`;
          }
        }
      }

      const debtAmount = parseFloat(formData.amount);
      console.log(`[DEBUG] Starting handleSubmit - Customer: ${selectedContact.name}, Debt amount: ${formatCurrency(debtAmount)}`);
      
      // Cek apakah customer memiliki saldo titip uang yang bisa dipotong otomatis
      const customerTitipUang = debts.filter(debt => 
        debt.contactName === selectedContact.name && 
        debt.description.includes('Titip uang') && 
        debt.remainingAmount > 0
      );

      console.log(`[DEBUG] Found ${customerTitipUang.length} titip uang records:`, customerTitipUang.map(d => ({
        id: d.id,
        description: d.description,
        remainingAmount: d.remainingAmount
      })));

      const totalTitipUang = customerTitipUang.reduce((sum, debt) => sum + debt.remainingAmount, 0);
      console.log(`[DEBUG] Total titip uang available: ${formatCurrency(totalTitipUang)}`);

      let finalRemainingAmount = debtAmount;
      let finalPaidAmount = 0;
      let finalStatus = 'pending';
      let autoPaymentMessage = '';

      // Jika ada titip uang, potong otomatis
      if (totalTitipUang > 0 && selectedContact.type === 'customer') {
        const amountToPay = Math.min(debtAmount, totalTitipUang);
        finalPaidAmount = amountToPay;
        finalRemainingAmount = debtAmount - amountToPay;
        finalStatus = finalRemainingAmount <= 0 ? 'completed' : 'partial';

        console.log(`[DEBUG] Auto payment - Titip uang tersedia: ${formatCurrency(totalTitipUang)}, Hutang baru: ${formatCurrency(debtAmount)}, Auto payment: ${formatCurrency(amountToPay)}`);

        // Update setiap record titip uang yang digunakan
        let amountLeft = amountToPay;
        for (const titipDebt of customerTitipUang) {
          if (amountLeft <= 0) break;
          
          const useAmount = Math.min(amountLeft, titipDebt.remainingAmount);
          const newRemainingTitip = titipDebt.remainingAmount - useAmount;
          const newPaidTitip = titipDebt.paidAmount + useAmount;
          const newStatusTitip = newRemainingTitip <= 0 ? 'completed' : 'partial';

          console.log(`[DEBUG] Processing titip debt ${titipDebt.id}:`);
          console.log(`[DEBUG] - Original remaining: ${formatCurrency(titipDebt.remainingAmount)}`);
          console.log(`[DEBUG] - Use amount: ${formatCurrency(useAmount)}`);
          console.log(`[DEBUG] - New remaining: ${formatCurrency(newRemainingTitip)}`);

          // Segera update Google Sheets
          try {
            const debtIndex = debts.findIndex(d => d.id === titipDebt.id);
            if (debtIndex === -1) {
              console.log(`[DEBUG] ERROR: Cannot find debt index for ${titipDebt.id}`);
              continue;
            }

            const updateRow = [
              titipDebt.id,
              titipDebt.contactId,
              titipDebt.contactName,
              titipDebt.contactType,
              titipDebt.type,
              titipDebt.description,
              titipDebt.amount || 0,
              titipDebt.productId || '',
              titipDebt.productName || '',
              titipDebt.quantity || 0,
              newStatusTitip,
              titipDebt.totalAmount,
              newPaidTitip,
              newRemainingTitip,
              titipDebt.dueDate || '',
              titipDebt.createdAt,
              now,
              titipDebt.notes || ''
            ];
            
            console.log(`[DEBUG] Updating Google Sheets row ${debtIndex + 2} with data:`, updateRow);
            const updateResult = await GoogleSheetsService.updateSheetRow('Debts', debtIndex + 2, updateRow);
            console.log(`[DEBUG] Update result:`, updateResult);
            
            if (updateResult && updateResult.success) {
              console.log(`[DEBUG] ✅ Successfully updated titip debt ${titipDebt.id}`);
              
              // Update state lokal juga agar perubahan langsung terlihat
              setDebts(prevDebts => 
                prevDebts.map(debt => 
                  debt.id === titipDebt.id 
                    ? {
                        ...debt,
                        status: newStatusTitip,
                        paidAmount: newPaidTitip,
                        remainingAmount: newRemainingTitip,
                        updatedAt: now
                      }
                    : debt
                )
              );
            } else {
              console.log(`[DEBUG] ❌ Failed to update titip debt ${titipDebt.id}:`, updateResult);
            }
          } catch (updateError) {
            console.error(`[DEBUG] Error updating titip debt ${titipDebt.id}:`, updateError);
          }

          amountLeft -= useAmount;
        }

        autoPaymentMessage = `\n\n💰 Pembayaran Otomatis:\n- Menggunakan saldo titip uang: ${formatCurrency(amountToPay)}\n- Sisa hutang: ${formatCurrency(finalRemainingAmount)}\n- Sisa saldo titip: ${formatCurrency(totalTitipUang - amountToPay)}`;
      }

      // Create new debt record
      const debtId = `DEBT_${Date.now()}`;
      const newDebtRow = [
        debtId,
        formData.contactId,
        selectedContact.name,
        selectedContact.type,
        formData.type,
        description,
        formData.type === 'money' ? parseFloat(formData.amount) : 0,
        formData.productId || '',
        formData.productId ? products.find(p => p.id === formData.productId)?.name || '' : '',
        formData.type === 'product' ? parseInt(formData.quantity) || 0 : 0,
        finalStatus,
        parseFloat(formData.amount),
        finalPaidAmount,
        finalRemainingAmount,
        formData.dueDate || '',
        now,
        now,
        description
      ];

      await GoogleSheetsService.appendToSheet('Debts', [newDebtRow]);

      // Update state lokal dengan hutang baru
      const newDebt: DebtRecord = {
        id: debtId,
        contactId: formData.contactId,
        contactName: selectedContact.name,
        contactType: selectedContact.type,
        type: formData.type,
        description,
        amount: formData.type === 'money' ? parseFloat(formData.amount) : 0,
        productId: formData.productId || '',
        productName: formData.productId ? products.find(p => p.id === formData.productId)?.name || '' : '',
        quantity: formData.type === 'product' ? parseInt(formData.quantity) || 0 : 0,
        status: finalStatus as 'pending' | 'partial' | 'completed',
        totalAmount: parseFloat(formData.amount),
        paidAmount: finalPaidAmount,
        remainingAmount: finalRemainingAmount,
        dueDate: formData.dueDate || '',
        createdAt: now,
        updatedAt: now,
        notes: description
      };
      
      setDebts(prevDebts => [...prevDebts, newDebt]);

      // Refresh data dulu untuk mendapatkan state terbaru
      console.log('[DEBUG AUTO-UPDATE] Refreshing data first to get latest state...');
      await loadData();
      
      // Tunggu sebentar agar Google Sheets API selesai processing semua perubahan
      console.log('[DEBUG AUTO-UPDATE] Waiting for Google Sheets to process changes...');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Reduced to 1.5 seconds

      // Auto-update StatusHutang setelah debt berhasil ditambahkan (run in background)
      console.log('[DEBUG SUBMIT] Starting auto-update StatusHutang after debt creation...');
      
      // Run StatusHutang update in background to not block UI
      autoUpdateStatusHutang(true).then(() => {
        console.log('[DEBUG SUBMIT] Auto-update StatusHutang completed');
      }).catch(error => {
        console.error('[DEBUG SUBMIT] Error in auto-update StatusHutang:', error);
      });

      console.log(`[DEBUG] Data submission completed successfully`);
      
      // Success - tutup form dan tampilkan success message
      setShowForm(false);
      resetForm();
      
      const successMessage = `Hutang berhasil ditambahkan!${autoPaymentMessage}`;
      showAlertModal('Success', successMessage, 'success');
    } catch (error) {
      console.error('Error adding debt:', error);
      showAlertModal('Error', 'Gagal menambahkan hutang!', 'error');
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };


  const handleBulkPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkPaymentData.customerName) {
      showAlertModal('Error Validasi', 'Pilih customer terlebih dahulu', 'error');
      return;
    }

    if (bulkPaymentData.paymentType === 'money') {
      if (!bulkPaymentData.moneyAmount || parseFloat(bulkPaymentData.moneyAmount) <= 0) {
        showAlertModal('Error Validasi', 'Masukkan jumlah pembayaran uang yang valid', 'error');
        return;
      }
    }

    // Show warning about physical payment - HANYA MODE TERIMA
    showConfirmModal(
      '💰 Konfirmasi Penerimaan Pembayaran',
      `PENTING: Pastikan Anda sudah menerima pembayaran fisik dari customer!\n\nCustomer: ${bulkPaymentData.customerName}\nJumlah: ${formatCurrency(parseFloat(bulkPaymentData.moneyAmount || '0'))}\n\n⚠️ Apakah Anda sudah benar-benar MENERIMA uang fisik dari customer?`,
      async () => {
        try {
          setLoading(true);
          
          // TERIMA: Customer bayar hutang ke toko
          if (bulkPaymentData.paymentType === 'money') {
            const customerDebts = debts.filter(debt => 
              debt.contactName === bulkPaymentData.customerName && 
              debt.status !== 'completed' &&
              debt.remainingAmount > 0 &&
              !debt.description.includes('Titip uang')
            );

          if (customerDebts.length === 0) {
            showAlertModal('Info', 'Customer tidak memiliki hutang yang perlu dibayar', 'alert');
            setLoading(false);
            return;
          }

          const paymentAmount = parseFloat(bulkPaymentData.moneyAmount);
          const now = getWIBTimestamp();
          const paymentsToCreate: (string | number)[][] = [];
          const debtsToUpdate: Array<{
            index: number;
            data: DebtRecord;
          }> = [];

          let remainingPayment = paymentAmount;

          // Process each debt
          for (const debt of customerDebts) {
            if (remainingPayment <= 0) break;

            const amountToApply = Math.min(remainingPayment, debt.remainingAmount);
            const newPaidAmount = debt.paidAmount + amountToApply;
            const newRemainingAmount = debt.remainingAmount - amountToApply;

            // Create payment record
            paymentsToCreate.push([
              `payment_${Date.now()}_${debt.id}`,
              debt.id,
              'money',
              amountToApply,
              '',
              '',
              formatWIBDate(new Date()),
              `Pembayaran hutang - ${bulkPaymentData.notes || 'Pembayaran bulk'}`,
              now
            ]);

            // Update debt status
            const newStatus = newRemainingAmount <= 0 ? 'completed' : 'partial';
            const debtIndex = debts.findIndex(d => d.id === debt.id);
            if (debtIndex !== -1) {
              debtsToUpdate.push({
                index: debtIndex,
                data: {
                  ...debt,
                  status: newStatus,
                  paidAmount: newPaidAmount,
                  remainingAmount: newRemainingAmount,
                  updatedAt: now
                }
              });
            }

            remainingPayment -= amountToApply;
          }

          // Handle overpayment (create titip uang)
          if (remainingPayment > 0) {
            const titipUangDebtRow = [
              `DEBT_${Date.now()}_TITIP`,
              customerDebts[0].contactId,
              bulkPaymentData.customerName,
              'customer',
              'money',
              `Titip uang dari pelunasan hutang - ${bulkPaymentData.notes || 'Overpayment'}`,
              0,
              '',
              '',
              0,
              'completed',
              remainingPayment,
              0,
              remainingPayment,
              '',
              now,
              now,
              `Kelebihan pembayaran sebesar ${formatCurrency(remainingPayment)}`
            ];

            await GoogleSheetsService.appendToSheet('Debts', [titipUangDebtRow]);

            // Create payment record for overpayment
            paymentsToCreate.push([
              `payment_${Date.now()}_OVERPAY`,
              `DEBT_${Date.now()}_TITIP`,
              'money',
              remainingPayment,
              '',
              '',
              formatWIBDate(new Date()),
              `Titip uang dari overpayment - ${bulkPaymentData.notes || 'Kelebihan pembayaran'}`,
              now
            ]);
          }

          // Save all payment records
          if (paymentsToCreate.length > 0) {
            await GoogleSheetsService.appendToSheet('DebtPayments', paymentsToCreate);
          }

          // Update all debt records
          for (const debtUpdate of debtsToUpdate) {
            const updateRow = [
              debtUpdate.data.id,
              debtUpdate.data.contactId,
              debtUpdate.data.contactName,
              debtUpdate.data.contactType,
              debtUpdate.data.type,
              debtUpdate.data.description,
              debtUpdate.data.amount,
              debtUpdate.data.productId,
              debtUpdate.data.productName,
              debtUpdate.data.quantity,
              debtUpdate.data.status,
              debtUpdate.data.totalAmount,
              debtUpdate.data.paidAmount,
              debtUpdate.data.remainingAmount,
              debtUpdate.data.dueDate,
              debtUpdate.data.createdAt,
              debtUpdate.data.updatedAt,
              debtUpdate.data.notes
            ];
            
            await GoogleSheetsService.updateSheetRow('Debts', debtUpdate.index + 2, updateRow);
          }

          await loadData();

          // Tunggu sebentar untuk memastikan Google Sheets ter-update
          await new Promise(resolve => setTimeout(resolve, 500)); // Reduced to 0.5 seconds

          console.log('[DEBUG BULK PAYMENT] Payment processing completed successfully');

          // Auto-update StatusHutang setelah bulk payment (run in background)
          console.log('[DEBUG BULK PAYMENT] Starting auto-update StatusHutang after bulk payment...');
          autoUpdateStatusHutang(true).then(() => {
            console.log('[DEBUG BULK PAYMENT] Auto-update StatusHutang completed');
          }).catch(error => {
            console.error('[DEBUG BULK PAYMENT] Error in auto-update StatusHutang:', error);
          });

          // Show success message
          let successMessage = `Pembayaran berhasil diproses!\n\nTotal dibayar: ${formatCurrency(paymentAmount)}`;
          if (remainingPayment > 0) {
            successMessage += `\nKelebihan pembayaran: ${formatCurrency(remainingPayment)} (dicatat sebagai Titip Uang)`;
          }

          showAlertModal('Success', successMessage, 'success');
          setBulkPaymentData({
            customerName: '',
            paymentType: 'money',
            moneyAmount: '',
            productId: '',
            productQuantity: '',
            notes: ''
          });
          setShowBulkPaymentForm(false);
          }
        } catch (error) {
          console.error('Error processing bulk payment:', error);
          showAlertModal('Error', 'Gagal memproses pembayaran!', 'error');
        } finally {
          setLoading(false);
        }
      },
      'Ya, Sudah Terima Uang',
      'Belum, Batal'
    );
  };

  // Individual debt payment handler
  const handleIndividualPayment = async (debt: DebtRecord, paymentAmount: number) => {
    try {
      setLoading(true);
      
      const now = getWIBTimestamp();
      const amountToApply = Math.min(paymentAmount, debt.remainingAmount);
      const newPaidAmount = debt.paidAmount + amountToApply;
      const newRemainingAmount = debt.remainingAmount - amountToApply;
      const overpayment = paymentAmount - amountToApply;

      // Create payment record
      const paymentRecord = [
        `payment_${Date.now()}_${debt.id}`,
        debt.id,
        'money',
        amountToApply,
        '',
        '',
        formatWIBDate(new Date()),
        `Pembayaran hutang - ${debt.description}`,
        now
      ];

      await GoogleSheetsService.appendToSheet('DebtPayments', [paymentRecord]);

      // Update debt record
      const newStatus = newRemainingAmount <= 0 ? 'completed' : 'partial';
      const updateRow = [
        debt.id,
        debt.contactId,
        debt.contactName,
        debt.contactType,
        debt.type,
        debt.description,
        debt.amount,
        debt.productId,
        debt.productName,
        debt.quantity,
        newStatus,
        debt.totalAmount,
        newPaidAmount,
        newRemainingAmount,
        debt.dueDate,
        debt.createdAt,
        now,
        debt.notes
      ];

      const debtIndex = debts.findIndex(d => d.id === debt.id);
      if (debtIndex !== -1) {
        await GoogleSheetsService.updateSheetRow('Debts', debtIndex + 2, updateRow);
      }

      // Handle overpayment
      if (overpayment > 0) {
        const titipUangDebtRow = [
          `DEBT_${Date.now()}_TITIP`,
          debt.contactId,
          debt.contactName,
          'customer',
          'money',
          `Titip uang dari pelunasan hutang: ${debt.description}`,
          0,
          '',
          '',
          0,
          'completed',
          overpayment,
          0,
          overpayment,
          '',
          now,
          now,
          `Kelebihan pembayaran sebesar ${formatCurrency(overpayment)}`
        ];

        await GoogleSheetsService.appendToSheet('Debts', [titipUangDebtRow]);

        const overpaymentRecord = [
          `payment_${Date.now()}_OVERPAY`,
          `DEBT_${Date.now()}_TITIP`,
          'money',
          overpayment,
          '',
          '',
          formatWIBDate(new Date()),
          `Titip uang dari overpayment`,
          now
        ];

        await GoogleSheetsService.appendToSheet('DebtPayments', [overpaymentRecord]);
      }

      await loadData();
      
      // Auto-update StatusHutang setelah individual payment (run in background)
      console.log('[DEBUG INDIVIDUAL PAYMENT] Starting auto-update StatusHutang after individual payment...');
      autoUpdateStatusHutang(true).then(() => {
        console.log('[DEBUG INDIVIDUAL PAYMENT] Auto-update StatusHutang completed');
      }).catch(error => {
        console.error('[DEBUG INDIVIDUAL PAYMENT] Error in auto-update StatusHutang:', error);
      });

      let successMessage = `Pembayaran berhasil diproses!\n\nJumlah dibayar: ${formatCurrency(amountToApply)}`;
      if (overpayment > 0) {
        successMessage += `\nKelebihan: ${formatCurrency(overpayment)} (dicatat sebagai Titip Uang)`;
      }

      showAlertModal('Success', successMessage, 'success');
    } catch (error) {
      console.error('Error processing individual payment:', error);
      showAlertModal('Error', 'Gagal memproses pembayaran!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate contact debt summary
  const getContactSummaries = (searchQuery = '') => {
    console.log('[DEBUG SUMMARIES] Getting contact summaries...');
    console.log('[DEBUG SUMMARIES] Search query:', searchQuery);
    console.log('[DEBUG SUMMARIES] Total debts:', debts.length);
    console.log('[DEBUG SUMMARIES] Total payments:', payments.length);
    console.log('[DEBUG SUMMARIES] First 3 debts:', debts.slice(0, 3));
    console.log('[DEBUG SUMMARIES] First debt example:', debts[0]);
    
    const summaries: { [contactName: string]: {
      contactName: string;
      contactType: 'customer' | 'supplier';
      totalDebt: number;
      totalPaid: number;
      totalOriginal: number;
      titipUang: number;
      titipBarang: number;
      cashOut: number;
      netBalance: number;
      debtCount: number;
      completedCount: number;
      lastDebtDate: string;
      lastDebtTime: string; // Tambahan: waktu spesifik input hutang terakhir
      lastPaymentDate: string;
      contactId: string;
    }} = {};

    debts.forEach(debt => {
      console.log(`[DEBUG DEBT] Processing debt:`, {
        contactName: debt.contactName,
        createdAt: debt.createdAt,
        updatedAt: debt.updatedAt, // Tambahkan logging updatedAt
        description: debt.description,
        totalAmount: debt.totalAmount,
        id: debt.id,
        remainingAmount: debt.remainingAmount
      });
      
      if (!summaries[debt.contactName]) {
        summaries[debt.contactName] = {
          contactName: debt.contactName,
          contactType: debt.contactType,
          totalDebt: 0,
          totalPaid: 0,
          totalOriginal: 0,
          titipUang: 0,
          titipBarang: 0,
          cashOut: 0,
          netBalance: 0,
          debtCount: 0,
          completedCount: 0,
          lastDebtDate: '',
          lastDebtTime: '', // Tambahan: waktu spesifik input hutang
          lastPaymentDate: '',
          contactId: debt.contactId
        };
      }

      const summary = summaries[debt.contactName];
      summary.debtCount++;
      
      // Track dates dengan validasi yang lebih baik - menggunakan updatedAt untuk waktu terakhir
      const dateToCheck = debt.updatedAt || debt.createdAt; // Prioritaskan updatedAt
      console.log(`[DEBUG DATE PROCESSING] For ${debt.contactName}:`, {
        updatedAt: debt.updatedAt,
        createdAt: debt.createdAt,
        dateToCheck: dateToCheck,
        dateToCheckType: typeof dateToCheck,
        dateToCheckLength: dateToCheck?.length,
        trimmedDateToCheck: dateToCheck?.trim()
      });
      
      if (dateToCheck && dateToCheck.trim() !== '') {
        try {
          console.log(`[DEBUG DATE PARSING] Attempting to parse date: "${dateToCheck}"`);
          
          // Gunakan parseWIBTimestamp untuk parsing yang konsisten
          const debtDate = parseWIBTimestamp(dateToCheck);
          
          console.log(`[DEBUG DATE PARSING] Parsed result:`, {
            originalString: dateToCheck,
            parsedDate: debtDate,
            isValid: !isNaN(debtDate.getTime()),
            timestamp: debtDate.getTime()
          });
          
          if (!isNaN(debtDate.getTime())) {
            // Selalu set lastDebtTime jika belum ada, atau jika debt ini lebih baru
            if (!summary.lastDebtTime || debtDate > parseWIBTimestamp(summary.lastDebtTime)) {
              console.log(`[DEBUG DATE] ✅ Updating lastDebtTime for ${debt.contactName}: ${dateToCheck} (from ${debt.updatedAt ? 'updatedAt' : 'createdAt'})`);
              console.log(`[DEBUG DATE] Previous lastDebtTime: ${summary.lastDebtTime}, New: ${dateToCheck}`);
              summary.lastDebtTime = dateToCheck;
            } else {
              console.log(`[DEBUG DATE] ⏭️ Keeping existing lastDebtTime for ${debt.contactName}: ${summary.lastDebtTime} (newer than ${dateToCheck})`);
            }
            
            // Juga update lastDebtDate untuk backward compatibility
            if (!summary.lastDebtDate || debtDate > parseWIBTimestamp(summary.lastDebtDate)) {
              console.log(`[DEBUG DATE] Updating lastDebtDate for ${debt.contactName}: ${dateToCheck}`);
              summary.lastDebtDate = dateToCheck;
            }
          } else {
            console.error(`[DEBUG DATE] ❌ Invalid date parsed for ${debt.contactName}: ${dateToCheck} -> ${debtDate}`);
          }
        } catch (error) {
          console.error(`[DEBUG DATE] ❌ Error parsing date for ${debt.contactName}: ${dateToCheck}`, error);
        }
      }
      
      if (debt.updatedAt && debt.updatedAt.trim() !== '' && debt.paidAmount > 0) {
        try {
          // Gunakan parseWIBTimestamp untuk konsistensi
          const paymentDate = parseWIBTimestamp(debt.updatedAt);
          if (!isNaN(paymentDate.getTime())) {
            // Compare dates properly - if no lastPaymentDate yet, or if this payment is newer
            if (!summary.lastPaymentDate || parseWIBTimestamp(debt.updatedAt) > parseWIBTimestamp(summary.lastPaymentDate)) {
              console.log(`[DEBUG DATE] Updating lastPaymentDate for ${debt.contactName}: ${debt.updatedAt}`);
              summary.lastPaymentDate = debt.updatedAt;
            }
          }
        } catch (error) {
          console.warn(`Invalid payment date for ${debt.contactName}: ${debt.updatedAt}`, error);
        }
      }
      
      if (debt.status === 'completed') {
        summary.completedCount++;
      }

      // Debug logging untuk pencairan
      if (debt.description.includes('Pencairan saldo customer') || debt.description.includes('CASHOUT')) {
        console.log(`[DEBUG SUMMARY] Processing cash out record:`, {
          id: debt.id,
          contactName: debt.contactName,
          description: debt.description,
          totalAmount: debt.totalAmount,
          remainingAmount: debt.remainingAmount
        });
      }

      // Klasifikasi berdasarkan jenis transaksi
      if (debt.description.includes('Titip uang') && !debt.description.includes('Pencairan')) {
        // Customer titip uang - hitung sisa yang belum digunakan
        // remainingAmount = sisa titip uang yang belum digunakan untuk bayar hutang
        summary.titipUang += debt.remainingAmount;
      } else if (debt.description.includes('Titip barang')) {
        // Customer titip barang - hitung sisa yang belum digunakan
        summary.titipBarang += debt.remainingAmount;
      } else if (debt.description.includes('Pencairan saldo customer') || debt.description.includes('CASHOUT')) {
        // Uang yang sudah diberikan ke customer (negative untuk toko)
        // Record pencairan memiliki amount negatif, jadi kita tambahkan ke cashOut
        summary.cashOut += Math.abs(debt.totalAmount);
        console.log(`[DEBUG SUMMARY] Added to cashOut: ${Math.abs(debt.totalAmount)}, total cashOut now: ${summary.cashOut}`);
      } else if (debt.remainingAmount > 0 && debt.totalAmount > 0) {
        // Hutang normal yang belum lunas
        summary.totalOriginal += debt.totalAmount;
        summary.totalPaid += debt.paidAmount;
        summary.totalDebt += debt.remainingAmount;
      }
    });

    // Process payment data for accurate payment dates
    console.log('[DEBUG PAYMENTS] Processing payment data for date tracking...');
    console.log('[DEBUG PAYMENTS] Total payments:', payments.length);
    payments.forEach(payment => {
      console.log('[DEBUG PAYMENTS] Processing payment:', {
        id: payment.id,
        debtId: payment.debtId,
        paymentDate: payment.paymentDate,
        amount: payment.amount
      });
      
      if (payment.paymentDate && payment.paymentDate.trim() !== '' && payment.amount > 0) {
        try {
          // Gunakan parseWIBTimestamp untuk konsistensi
          const paymentDate = parseWIBTimestamp(payment.paymentDate);
          if (!isNaN(paymentDate.getTime())) {
            // Find matching contact by looking up debt records
            debts.forEach(debt => {
              if (debt.id === payment.debtId) {
                const contactName = debt.contactName;
                console.log('[DEBUG PAYMENTS] Found matching debt for payment:', {
                  paymentId: payment.id,
                  debtId: debt.id,
                  contactName: contactName,
                  paymentDate: payment.paymentDate
                });
                
                if (summaries[contactName]) {
                  // Update last payment date if this payment is newer
                  if (!summaries[contactName].lastPaymentDate || 
                      parseWIBTimestamp(payment.paymentDate) > parseWIBTimestamp(summaries[contactName].lastPaymentDate)) {
                    console.log(`[DEBUG PAYMENTS] Updating lastPaymentDate for ${contactName}: ${payment.paymentDate}`);
                    summaries[contactName].lastPaymentDate = payment.paymentDate;
                  }
                } else {
                  console.warn(`[DEBUG PAYMENTS] Contact ${contactName} not found in summaries`);
                }
              }
            });
          }
        } catch (error) {
          console.warn(`Invalid payment date: ${payment.paymentDate}`, error);
        }
      } else {
        console.log('[DEBUG PAYMENTS] Skipping payment - invalid date or zero amount');
      }
    });

    Object.values(summaries).forEach(summary => {
      // Pastikan lastDebtTime ter-set jika ada debt tapi lastDebtTime masih kosong
      if (summary.debtCount > 0 && !summary.lastDebtTime && summary.lastDebtDate) {
        console.log(`[DEBUG FALLBACK] Setting lastDebtTime from lastDebtDate for ${summary.contactName}: ${summary.lastDebtDate}`);
        summary.lastDebtTime = summary.lastDebtDate;
      }
      
      // Net balance: Hutang customer - Titip uang/barang customer - Cash out yang sudah diberikan
      // Cash out mengurangi kredit customer (menambah saldo ke arah positif/hutang)
      summary.netBalance = summary.totalDebt - summary.titipUang - summary.titipBarang + summary.cashOut;
      
      // Debug untuk customer yang punya cash out
      if (summary.cashOut > 0) {
        console.log(`[DEBUG SUMMARY] ${summary.contactName} final calculation:`, {
          totalDebt: summary.totalDebt,
          titipUang: summary.titipUang,
          titipBarang: summary.titipBarang,
          cashOut: summary.cashOut,
          netBalance: summary.netBalance,
          explanation: `${summary.totalDebt} (debt) - ${summary.titipUang} (titip) - ${summary.titipBarang} (barang) + ${summary.cashOut} (cashout) = ${summary.netBalance}`
        });
      }
    });

    const result = Object.values(summaries)
      .filter(summary => {
        // Filter by search query
        if (searchQuery.trim()) {
          return summary.contactName.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      })
      .sort((a, b) => sortContactSummaries(a, b, sortBy));
    
    console.log('[DEBUG SUMMARIES] Final summaries count:', result.length);
    if (result.length > 0) {
      console.log('[DEBUG SUMMARIES] First summary result:', {
        contactName: result[0].contactName,
        lastDebtTime: result[0].lastDebtTime,
        lastDebtDate: result[0].lastDebtDate,
        lastPaymentDate: result[0].lastPaymentDate,
        netBalance: result[0].netBalance,
        debtCount: result[0].debtCount
      });
      
      // Log semua contact dengan detail
      result.forEach((summary, index) => {
        console.log(`[DEBUG SUMMARIES] Contact ${index + 1}: ${summary.contactName}`, {
          lastDebtTime: summary.lastDebtTime,
          lastDebtDate: summary.lastDebtDate,
          debtCount: summary.debtCount,
          hasPaymentDate: !!summary.lastPaymentDate
        });
      });
    }
    
    return result;
  };

  // Fungsi sorting dinamis untuk contact summaries
  const sortContactSummaries = (a: any, b: any, sortType: typeof sortBy) => {
    switch (sortType) {
      case 'lastDebtTime':
        // Primary sort: by last debt time (newest first - waktu input hutang)
        if (a.lastDebtTime && b.lastDebtTime) {
          const timeA = new Date(a.lastDebtTime);
          const timeB = new Date(b.lastDebtTime);
          if (timeA.getTime() !== timeB.getTime()) {
            console.log(`[DEBUG SORT] Comparing ${a.contactName} (${a.lastDebtTime}) vs ${b.contactName} (${b.lastDebtTime})`);
            return timeB.getTime() - timeA.getTime(); // Newest first
          }
        } else if (a.lastDebtTime && !b.lastDebtTime) {
          return -1; // a has debt time, b doesn't - a comes first
        } else if (!a.lastDebtTime && b.lastDebtTime) {
          return 1; // b has debt time, a doesn't - b comes first
        }
        // Fallback to name if same time
        return a.contactName.localeCompare(b.contactName);

      case 'netBalance':
        // Sort by net balance (highest debt first, then lowest negative balance)
        if (a.netBalance !== b.netBalance) {
          return b.netBalance - a.netBalance;
        }
        // Fallback to name if same balance
        return a.contactName.localeCompare(b.contactName);

      case 'contactName':
        // Alphabetical sort by contact name
        return a.contactName.localeCompare(b.contactName);

      case 'lastPaymentDate':
        // Sort by last payment date (newest first)
        if (a.lastPaymentDate && b.lastPaymentDate) {
          const paymentA = new Date(a.lastPaymentDate);
          const paymentB = new Date(b.lastPaymentDate);
          if (paymentA.getTime() !== paymentB.getTime()) {
            return paymentB.getTime() - paymentA.getTime(); // Newest first
          }
        } else if (a.lastPaymentDate && !b.lastPaymentDate) {
          return -1; // a has payment date, b doesn't - a comes first
        } else if (!a.lastPaymentDate && b.lastPaymentDate) {
          return 1; // b has payment date, a doesn't - b comes first
        }
        // Fallback to name if same payment date
        return a.contactName.localeCompare(b.contactName);

      case 'debtCount':
        // Sort by debt count (highest count first)
        if (a.debtCount !== b.debtCount) {
          return b.debtCount - a.debtCount;
        }
        // Fallback to name if same count
        return a.contactName.localeCompare(b.contactName);

      default:
        return a.contactName.localeCompare(b.contactName);
    }
  };

  const contactSummaries = getContactSummaries(contactSearchQuery);
  
  // Debug final summaries before rendering
  console.log('[DEBUG FINAL] Contact summaries for render:', contactSummaries.length);
  console.log('[DEBUG FINAL] First contact summary:', contactSummaries[0]);
  contactSummaries.forEach((summary, index) => {
    if (index < 3) { // Log first 3 contacts
      console.log(`[DEBUG FINAL] Contact ${index + 1}:`, {
        name: summary.contactName,
        debtCount: summary.debtCount,
        lastDebtTime: summary.lastDebtTime,
        lastDebtDate: summary.lastDebtDate,
        totalDebt: summary.totalDebt
      });
    }
  });



  const filteredDebts = debts.filter(debt => {
    if (debt.description.includes('Titip uang')) {
      return false;
    }
    
    const matchesFilter = filter === 'all' || debt.contactType === filter;
    const matchesStatus = statusFilter === 'all' || debt.status === statusFilter;
    return matchesFilter && matchesStatus;
  });

  // Auto-update status hutang untuk setiap contact
  const autoUpdateStatusHutang = async (forceRefresh = false) => {
    try {
      console.log('🔄 Auto-updating StatusHutang...');
      
      // Pastikan StatusHutang sheet exists
      console.log('[DEBUG StatusHutang] Ensuring StatusHutang sheet exists...');
      // Note: StatusHutang sheet will be created automatically if it doesn't exist
      console.log('[DEBUG StatusHutang] StatusHutang sheet confirmed to exist');
      
      // Jika forceRefresh, tunggu sebentar dan refresh data dulu
      if (forceRefresh) {
        console.log('[DEBUG StatusHutang] Force refresh requested, waiting and reloading data...');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Reduced to 1.5 seconds
        
        // Reload data dari Google Sheets untuk mendapatkan data terbaru
        console.log('[DEBUG StatusHutang] Reloading fresh data from Google Sheets...');
        try {
          await Promise.all([
            loadDebts(),
            loadContacts(),
            loadProducts(),
            loadPayments()
          ]);
          console.log('[DEBUG StatusHutang] Data refreshed successfully');
        } catch (refreshError) {
          console.error('[DEBUG StatusHutang] Error refreshing data:', refreshError);
          // Continue with existing data if refresh fails
        }
        
        console.log('[DEBUG StatusHutang] Data refreshed, waiting a bit more before processing...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced additional wait
      }
      
      // Get contact summaries dengan data terbaru
      const summaries = getContactSummaries(); // Don't filter here, use all contacts for stats
      console.log(`[DEBUG StatusHutang] Processing ${summaries.length} contact summaries`);
      
      // Validate if we have any data to process
      if (summaries.length === 0) {
        console.log('[DEBUG StatusHutang] No contact summaries to process, skipping...');
        return;
      }
      
      for (const summary of summaries) {
        try {
          // Skip contacts with zero balance and no activity
          if (summary.totalDebt === 0 && summary.debtCount === 0) {
            console.log(`[DEBUG StatusHutang] Skipping ${summary.contactName} - no activity`);
            continue;
          }
          
          // Debug contact ID validation
          console.log(`[DEBUG StatusHutang] Contact ID validation for ${summary.contactName}:`, {
            contactId: summary.contactId,
            contactIdType: typeof summary.contactId,
            contactIdLength: summary.contactId?.length
          });
          
          // Validate contact ID
          if (!summary.contactId || summary.contactId.trim() === '') {
            console.error(`[DEBUG StatusHutang] ❌ Invalid contact ID for ${summary.contactName}, skipping...`);
            continue;
          }
          
          console.log(`[DEBUG StatusHutang] Processing ${summary.contactName}:`, {
            contactId: summary.contactId,
            totalOriginal: summary.totalOriginal,
            totalPaid: summary.totalPaid,
            totalDebt: summary.totalDebt,
            netBalance: summary.netBalance,
            debtCount: summary.debtCount,
            lastDebtDate: summary.lastDebtDate,
            lastPaymentDate: summary.lastPaymentDate
          });
          
          // Determine status
          let status = 'LUNAS';
          if (summary.netBalance > 0) {
            status = 'HUTANG';
          } else if (summary.netBalance < 0) {
            status = 'TITIP_UANG';
          }
          
          // Format waktu terakhir hutang dan bayar dalam format ISO
          const formatWIBTime = (dateString: string) => {
            if (!dateString) return '';
            try {
              const date = new Date(dateString);
              // Convert to ISO format: YYYY-MM-DD HH:MM:SS (compatible with Google Sheets)
              return date.toISOString().replace('T', ' ').substring(0, 19);
            } catch (error) {
              console.log('Error formatting date:', error);
              return '';
            }
          };
          
          const statusData = {
            contactId: summary.contactId,
            contactName: summary.contactName,
            contactType: summary.contactType,
            totalHutang: summary.totalOriginal,
            totalTerbayar: summary.totalPaid,
            sisaHutang: summary.totalDebt,
            saldoBersih: summary.netBalance,
            status: status,
            terakhirHutang: summary.lastDebtDate ? formatWIBTime(summary.lastDebtDate) : '',
            terakhirBayar: summary.lastPaymentDate ? formatWIBTime(summary.lastPaymentDate) : ''
          };
          
          console.log(`[DEBUG StatusHutang] Sending data for ${summary.contactName}:`, statusData);
          
          // Retry mechanism untuk memastikan data terkirim
          let retryCount = 0;
          const maxRetries = 3;
          let updateSuccess = false;
          
          while (retryCount < maxRetries && !updateSuccess) {
            try {
              updateSuccess = await GoogleSheetsService.updateStatusHutang(statusData);
              if (!updateSuccess) {
                console.warn(`[DEBUG StatusHutang] Update failed for ${summary.contactName}, retry ${retryCount + 1}/${maxRetries}`);
                retryCount++;
                if (retryCount < maxRetries) {
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
                }
              } else {
                console.log(`[DEBUG StatusHutang] ✅ Successfully updated ${summary.contactName} on attempt ${retryCount + 1}`);
              }
            } catch (error) {
              console.error(`[DEBUG StatusHutang] Error updating ${summary.contactName} on attempt ${retryCount + 1}:`, error);
              retryCount++;
              if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
              }
            }
          }
          
          if (!updateSuccess) {
            console.error(`[DEBUG StatusHutang] ❌ Failed to update ${summary.contactName} after ${maxRetries} attempts`);
          }
          
        } catch (contactError) {
          console.error(`[DEBUG StatusHutang] Error processing contact ${summary.contactName}:`, contactError);
          // Continue with next contact
        }
      }
      
      console.log(`✅ StatusHutang auto-update completed for ${summaries.length} contacts`);
      
    } catch (error) {
      console.error('❌ Error auto-updating StatusHutang:', error);
      // Don't throw the error to prevent breaking the main flow
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading debts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Hutang</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola hutang piutang customer dan supplier
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => {
              console.log('[DEBUG MANUAL] Manual StatusHutang update triggered');
              autoUpdateStatusHutang(true).then(() => {
                console.log('[DEBUG MANUAL] Manual StatusHutang update completed');
                showAlertModal('Success', 'StatusHutang berhasil di-update!', 'success');
              }).catch(error => {
                console.error('[DEBUG MANUAL] Error in manual StatusHutang update:', error);
                showAlertModal('Error', 'Gagal update StatusHutang!', 'error');
              });
            }}
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              loading
                ? 'text-white bg-indigo-400 cursor-not-allowed opacity-75'
                : 'text-white bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Update StatusHutang
          </button>
          <button
            onClick={() => {
              setBulkPaymentData({
                customerName: '',
                paymentType: 'money',
                moneyAmount: '',
                productId: '',
                productQuantity: '',
                notes: ''
              });
              setShowBulkPaymentForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            Pembayaran Hutang
          </button>
          <button
            onClick={() => {
              if (loading || submitting) return; // Prevent opening form during submission
              resetForm();
              setShowForm(true);
            }}
            disabled={loading || submitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
              loading || submitting
                ? 'text-white bg-blue-400 cursor-not-allowed opacity-75'
                : 'text-white bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {(loading || submitting) ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4 mr-2" />
                Tambah Hutang
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Ringkasan Hutang & Piutang per Kontak
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Daftar Hutang Detail
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Hutang</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(contactSummaries.reduce((sum, s) => sum + Math.max(0, s.netBalance), 0))}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 text-green-500 text-lg">💰</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Titip Uang & Barang</dt>
                      <dd className="text-lg font-medium text-green-600">
                        {formatCurrency(contactSummaries.reduce((sum, s) => sum + Math.abs(Math.min(0, s.netBalance)), 0))}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Sudah Lunas</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {contactSummaries.filter(summary => summary.netBalance <= 0).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XMarkIcon className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Belum Lunas</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {contactSummaries.filter(summary => summary.netBalance > 0).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 text-blue-500 text-lg">👥</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Customer dengan Titip</dt>
                      <dd className="text-lg font-medium text-blue-600">
                        {contactSummaries.filter(s => s.netBalance < 0).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Debt Summaries */}
          <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Ringkasan Hutang & Piutang per Kontak</h3>
          <p className="mt-1 text-sm text-gray-600">
            Menampilkan total hutang, titip uang, dan saldo bersih untuk setiap kontak
          </p>
          
          {/* Search Input */}
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Cari nama kontak..."
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mobile-input mobile-touch-target"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {contactSearchQuery && (
                <button
                  onClick={() => setContactSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            {/* Search Results Info */}
            {contactSearchQuery && (
              <div className="mt-2 text-sm text-gray-600">
                Menampilkan {contactSummaries.length} kontak dari pencarian "{contactSearchQuery}"
                {contactSummaries.length === 0 && (
                  <span className="text-red-600 ml-2">- Tidak ada kontak yang ditemukan</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          {/* Table sorting controls */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              ↓ Diurutkan berdasarkan:
            </p>
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="lastDebtTime">Waktu Input Hutang Terbaru</option>
                <option value="netBalance">Saldo Tertinggi</option>
                <option value="contactName">Nama Kontak (A-Z)</option>
                <option value="lastPaymentDate">Waktu Bayar Terakhir</option>
                <option value="debtCount">Jumlah Transaksi Terbanyak</option>
              </select>
            </div>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu Catat Hutang Terakhir
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Hutang
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titip Uang + Barang
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo Bersih
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tgl Bayar Terakhir
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contactSummaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Belum ada data hutang
                  </td>
                </tr>
              ) : (
                contactSummaries.map((summary) => (
                  <tr key={summary.contactName} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {summary.contactName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {summary.debtCount} hutang ({summary.completedCount} lunas)
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(summary.lastDebtTime || summary.lastDebtDate) && (summary.debtCount > 0) ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {(() => {
                              try {
                                const dateToUse = summary.lastDebtTime || summary.lastDebtDate;
                                console.log(`[DEBUG DISPLAY] Formatting date for ${summary.contactName}:`, {
                                  dateToUse: dateToUse,
                                  type: typeof dateToUse,
                                  includesWIB: dateToUse?.includes('WIB')
                                });
                                
                                // Gunakan parseWIBTimestamp untuk parsing yang benar
                                const parsedDate = parseWIBTimestamp(dateToUse);
                                
                                console.log(`[DEBUG DISPLAY] Parsed date result:`, {
                                  original: dateToUse,
                                  parsed: parsedDate,
                                  isValid: !isNaN(parsedDate.getTime())
                                });
                                
                                if (!isNaN(parsedDate.getTime())) {
                                  return formatWIBDate(parsedDate);
                                } else {
                                  return 'Format tanggal tidak valid';
                                }
                              } catch (error) {
                                console.error('Error formatting date:', error, 'Date:', summary.lastDebtTime || summary.lastDebtDate);
                                return 'Format tanggal error';
                              }
                            })()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(() => {
                              try {
                                if (summary.lastDebtTime) {
                                  console.log(`[DEBUG TIME] Formatting time for ${summary.contactName}:`, summary.lastDebtTime);
                                  
                                  // Gunakan parseWIBTimestamp untuk parsing yang benar
                                  const parsedDate = parseWIBTimestamp(summary.lastDebtTime);
                                  
                                  if (!isNaN(parsedDate.getTime())) {
                                    return parsedDate.toLocaleTimeString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit'
                                    }) + ' WIB';
                                  } else {
                                    return 'Format waktu tidak valid';
                                  }
                                } else {
                                  return 'Waktu tidak tersedia';
                                }
                              } catch (error) {
                                console.error('Error formatting time:', error);
                                return 'Format waktu error';
                              }
                            })()}
                          </div>
                          <div className="text-xs mt-1">
                            <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded ${
                              summary.contactType === 'customer' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {summary.contactType === 'customer' ? 'Customer' : 'Supplier'}
                            </span>
                          </div>
                          {summary.debtCount > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              {summary.debtCount} hutang total
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-gray-400">
                            {summary.debtCount > 0 ? 'Data tanggal tidak valid' : 'Belum ada hutang'}
                          </div>
                          <div className="text-xs mt-1">
                            <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded ${
                              summary.contactType === 'customer' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {summary.contactType === 'customer' ? 'Customer' : 'Supplier'}
                            </span>
                          </div>
                          {summary.debtCount > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              {summary.debtCount} hutang, tanggal tidak valid
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(summary.totalDebt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        dari {formatCurrency(summary.totalOriginal)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${
                        (summary.titipUang + summary.titipBarang) > 0 ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {(summary.titipUang + summary.titipBarang) > 0 ? formatCurrency(summary.titipUang + summary.titipBarang) : '-'}
                      </div>
                      {(summary.titipUang + summary.titipBarang) > 0 && (
                        <div className="text-xs text-green-500">
                          {summary.titipUang > 0 && `💰 ${formatCurrency(summary.titipUang)}`}
                          {summary.titipUang > 0 && summary.titipBarang > 0 && ' + '}
                          {summary.titipBarang > 0 && `📦 ${formatCurrency(summary.titipBarang)}`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-bold ${
                        summary.netBalance > 0 
                          ? 'text-red-600' 
                          : summary.netBalance < 0 
                            ? 'text-green-600' 
                            : 'text-gray-600'
                      }`}>
                        {summary.netBalance === 0 
                          ? 'Lunas' 
                          : formatCurrency(Math.abs(summary.netBalance))
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {summary.netBalance > 0 
                          ? 'Masih hutang' 
                          : summary.netBalance < 0 
                            ? 'Titip uang' 
                            : 'Saldo nol'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {summary.netBalance === 0 ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          ✓ Selesai
                        </span>
                      ) : summary.netBalance > 0 ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          ⚠ Hutang
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          💰 Titip Uang
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {summary.lastPaymentDate ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {(() => {
                              try {
                                console.log(`[DEBUG PAYMENT DATE] Formatting payment date for ${summary.contactName}:`, {
                                  lastPaymentDate: summary.lastPaymentDate,
                                  type: typeof summary.lastPaymentDate,
                                  includesWIB: summary.lastPaymentDate?.includes('WIB')
                                });
                                
                                // Gunakan parseWIBTimestamp untuk parsing yang benar
                                const parsedDate = parseWIBTimestamp(summary.lastPaymentDate);
                                
                                if (!isNaN(parsedDate.getTime())) {
                                  return formatWIBDate(parsedDate);
                                } else {
                                  return 'Format tanggal tidak valid';
                                }
                              } catch (error) {
                                console.error('Error formatting payment date:', error, 'Date:', summary.lastPaymentDate);
                                return 'Format tanggal error';
                              }
                            })()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(() => {
                              try {
                                console.log(`[DEBUG PAYMENT TIME] Formatting payment time for ${summary.contactName}:`, summary.lastPaymentDate);
                                
                                // Gunakan parseWIBTimestamp untuk parsing yang benar
                                const parsedDate = parseWIBTimestamp(summary.lastPaymentDate);
                                
                                if (!isNaN(parsedDate.getTime())) {
                                  return parsedDate.toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  }) + ' WIB';
                                } else {
                                  return 'Format waktu tidak valid';
                                }
                              } catch (error) {
                                console.error('Error formatting payment time:', error);
                                return 'Format waktu error';
                              }
                            })()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">
                          Belum ada pembayaran
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        {/* Tombol Lunaskan untuk customer yang punya hutang */}
                        {summary.contactType === 'customer' && summary.netBalance > 0 && (
                          <button
                            onClick={() => {
                              showConfirmModal(
                                'Konfirmasi Pelunasan Hutang',
                                `Apakah Anda akan melunaskan semua hutang kepada customer berikut?\n\nCustomer: ${summary.contactName}\nTotal Hutang: ${formatCurrency(summary.totalDebt)}`,
                                async () => {
                                  setModalState(prev => ({ ...prev, show: false }));
                                  setLoading(true);
                                  try {
                                    // Ambil semua hutang customer yang belum lunas
                                    const customerDebts = debts.filter(debt =>
                                      debt.contactName === summary.contactName &&
                                      debt.status !== 'completed' &&
                                      debt.remainingAmount > 0 &&
                                      !debt.description.includes('Titip uang')
                                    );
                                    if (customerDebts.length === 0) {
                                      showAlertModal('Info', 'Customer tidak memiliki hutang yang perlu dilunasi', 'alert');
                                      setLoading(false);
                                      return;
                                    }
                                    let remainingPayment = summary.totalDebt;
                                    const now = getWIBTimestamp();
                                    const paymentsToCreate = [];
                                    const debtsToUpdate = [];
                                    for (const debt of customerDebts) {
                                      if (remainingPayment <= 0) break;
                                      const amountToApply = Math.min(remainingPayment, debt.remainingAmount);
                                      const newPaidAmount = debt.paidAmount + amountToApply;
                                      const newRemainingAmount = debt.remainingAmount - amountToApply;
                                      paymentsToCreate.push([
                                        `payment_${Date.now()}_${debt.id}`,
                                        debt.id,
                                        'money',
                                        amountToApply,
                                        '',
                                        '',
                                        formatWIBDate(new Date()),
                                        `Pelunasan otomatis semua hutang`,
                                        now
                                      ]);
                                      const newStatus = newRemainingAmount <= 0 ? 'completed' : 'partial';
                                      const debtIndex = debts.findIndex(d => d.id === debt.id);
                                      if (debtIndex !== -1) {
                                        debtsToUpdate.push({
                                          index: debtIndex,
                                          data: {
                                            ...debt,
                                            status: newStatus,
                                            paidAmount: newPaidAmount,
                                            remainingAmount: newRemainingAmount,
                                            updatedAt: now
                                          }
                                        });
                                      }
                                      remainingPayment -= amountToApply;
                                    }
                                    // Overpayment
                                    if (remainingPayment > 0) {
                                      const titipUangDebtRow = [
                                        `DEBT_${Date.now()}_TITIP`,
                                        customerDebts[0].contactId,
                                        summary.contactName,
                                        'customer',
                                        'money',
                                        `Titip uang dari pelunasan hutang otomatis`,
                                        0,
                                        '',
                                        '',
                                        0,
                                        'completed',
                                        remainingPayment,
                                        0,
                                        remainingPayment,
                                        '',
                                        now,
                                        now,
                                        `Kelebihan pembayaran sebesar ${formatCurrency(remainingPayment)}`
                                      ];
                                      await GoogleSheetsService.appendToSheet('Debts', [titipUangDebtRow]);
                                      paymentsToCreate.push([
                                        `payment_${Date.now()}_OVERPAY`,
                                        `DEBT_${Date.now()}_TITIP`,
                                        'money',
                                        remainingPayment,
                                        '',
                                        '',
                                        formatWIBDate(new Date()),
                                        `Titip uang dari overpayment`,
                                        now
                                      ]);
                                    }
                                    if (paymentsToCreate.length > 0) {
                                      await GoogleSheetsService.appendToSheet('DebtPayments', paymentsToCreate);
                                    }
                                    for (const debtUpdate of debtsToUpdate) {
                                      const updateRow = [
                                        debtUpdate.data.id,
                                        debtUpdate.data.contactId,
                                        debtUpdate.data.contactName,
                                        debtUpdate.data.contactType,
                                        debtUpdate.data.type,
                                        debtUpdate.data.description,
                                        debtUpdate.data.amount,
                                        debtUpdate.data.productId,
                                        debtUpdate.data.productName,
                                        debtUpdate.data.quantity,
                                        debtUpdate.data.status,
                                        debtUpdate.data.totalAmount,
                                        debtUpdate.data.paidAmount,
                                        debtUpdate.data.remainingAmount,
                                        debtUpdate.data.dueDate,
                                        debtUpdate.data.createdAt,
                                        debtUpdate.data.updatedAt,
                                        debtUpdate.data.notes
                                      ];
                                      await GoogleSheetsService.updateSheetRow('Debts', debtUpdate.index + 2, updateRow);
                                    }
                                    await loadData();
                                    showAlertModal('Success', 'Semua hutang customer berhasil dilunasi!', 'success');
                                  } catch (error) {
                                    console.error('Error in bulk debt settlement:', error);
                                    showAlertModal('Error', 'Gagal melunasi hutang!', 'error');
                                  } finally {
                                    setLoading(false);
                                  }
                                },
                                'Lunaskan Hutang',
                                'Batal'
                              );
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                            title="Lunaskan Semua Hutang"
                          >
                            💳 Lunaskan
                          </button>
                        )}
                        {/* Tombol Terima untuk customer */}
                        {summary.contactType === 'customer' && (
                          <button
                            onClick={() => {
                              // setBulkPaymentMode('terima'); // Removed - always terima mode
                              setBulkPaymentData({
                                customerName: summary.contactName,
                                paymentType: 'money',
                                moneyAmount: '',
                                productId: '',
                                productQuantity: '',
                                notes: `Terima pembayaran dari ${summary.contactName}`
                              });
                              setShowBulkPaymentForm(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                            title="Terima Pembayaran dari Customer"
                          >
                            💰 Terima Bayar
                          </button>
                        )}
                        {/* Tombol WhatsApp untuk semua kontak */}
                        <button
                          onClick={() => {
                            const contact = contacts.find(c => c.name === summary.contactName);
                            if (contact?.phone) {
                              sendWhatsAppMessage(summary.contactName, contact.phone, summary);
                            } else {
                              showAlertModal('Error', `Nomor WhatsApp tidak tersedia untuk ${summary.contactName}. Silakan tambahkan nomor di data kontak sheet Contacts.`, 'error');
                            }
                          }}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                          title="Kirim Pesan WhatsApp"
                        >
                          📱 WhatsApp
                        </button>
                        {/* Tombol Berikan untuk customer */}
                        {summary.contactType === 'customer' && (
                          <button
                            onClick={() => {
                              // Cari contact ID berdasarkan nama
                              const selectedContact = contacts.find(c => c.name === summary.contactName);
                              if (selectedContact) {
                                // Set form data dengan contact yang sudah dipilih
                                setFormData({
                                  contactId: selectedContact.id,
                                  type: 'money',
                                  amount: '',
                                  productId: '',
                                  quantity: '',
                                  dueDate: '',
                                  notes: ''
                                });
                                setShowForm(true);
                              } else {
                                showAlertModal('Error', 'Contact tidak ditemukan!', 'error');
                              }
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                            title="Berikan Hutang ke Customer"
                          >
                            📋 Berikan Hutang
                          </button>
                        )}
                        {/* Tombol Cairkan untuk customer yang punya saldo bersih positif (kredit) */}
                        {summary.contactType === 'customer' && summary.netBalance < 0 && (
                          <button
                            onClick={() => {
                              const cashOutAmount = Math.abs(summary.netBalance);
                              
                              showConfirmModal(
                                '💰 Konfirmasi Pencairan Saldo Customer',
                                `Apakah Anda akan mencairkan saldo customer berikut?\n\nCustomer: ${summary.contactName}\nSaldo Bersih: ${formatCurrency(cashOutAmount)}\n\n⚠️ PENTING: Pastikan Anda benar-benar akan memberikan uang tunai kepada customer!\n\nCatatan: Ini akan mengubah semua saldo customer menjadi nol.`,
                                async () => {
                                  setModalState(prev => ({ ...prev, show: false }));
                                  setLoading(true);
                                  try {
                                    const cashOutAmount = Math.abs(summary.netBalance);
                                    
                                    console.log(`[DEBUG CAIRKAN] Customer: ${summary.contactName}`);
                                    console.log(`[DEBUG CAIRKAN] Net Balance: ${summary.netBalance}`);
                                    console.log(`[DEBUG CAIRKAN] Cash Out Amount: ${cashOutAmount}`);

                                    const now = getWIBTimestamp();
                                    const selectedContact = contacts.find(c => c.name === summary.contactName);
                                    
                                    // Buat record cash out (pengeluaran uang ke customer)
                                    const cashOutRow = [
                                      `DEBT_${Date.now()}_CASHOUT_SALDO`,
                                      selectedContact?.id || '',
                                      summary.contactName,
                                      'customer',
                                      'money',
                                      `Pencairan saldo customer - ${formatCurrency(cashOutAmount)}`,
                                      -cashOutAmount, // Negative karena pengeluaran
                                      '',
                                      '',
                                      0,
                                      'completed',
                                      -cashOutAmount,
                                      -cashOutAmount,
                                      0,
                                      '',
                                      now,
                                      now,
                                      `Cairkan saldo customer sebesar ${formatCurrency(cashOutAmount)}`
                                    ];

                                    console.log(`[DEBUG CAIRKAN] Creating cash out record:`, cashOutRow);
                                    await GoogleSheetsService.appendToSheet('Debts', [cashOutRow]);

                                    // Buat payment record untuk pencairan
                                    const paymentRecord = [
                                      `payment_${Date.now()}_CASHOUT_SALDO`,
                                      `DEBT_${Date.now()}_CASHOUT_SALDO`,
                                      'money',
                                      -cashOutAmount,
                                      '',
                                      '',
                                      formatWIBDate(new Date()),
                                      `Pencairan saldo customer ${summary.contactName}`,
                                      now
                                    ];

                                    console.log(`[DEBUG CAIRKAN] Creating payment record:`, paymentRecord);
                                    await GoogleSheetsService.appendToSheet('DebtPayments', [paymentRecord]);

                                    console.log(`[DEBUG CAIRKAN] Reloading data...`);
                                    await loadData();
                                    
                                    // Debug: Periksa saldo setelah reload
                                    console.log(`[DEBUG CAIRKAN] Checking balance after reload...`);
                                    const updatedSummaries = getContactSummaries(); // Don't filter here
                                    const updatedCustomer = updatedSummaries.find(s => s.contactName === summary.contactName);
                                    console.log(`[DEBUG CAIRKAN] Updated customer summary:`, updatedCustomer);

                                    showAlertModal('Success', `Berhasil mencairkan saldo customer!\n\nCustomer: ${summary.contactName}\nJumlah: ${formatCurrency(cashOutAmount)}\n\n💰 Silakan berikan uang tunai kepada customer\n\n✅ Saldo customer sekarang menjadi nol`, 'success');
                                  } catch (error) {
                                    console.error('Error processing cash out:', error);
                                    showAlertModal('Error', 'Gagal memproses pencairan saldo!', 'error');
                                  } finally {
                                    setLoading(false);
                                  }
                                },
                                'Ya, Cairkan Sekarang',
                                'Batal'
                              );
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                            title="Cairkan Saldo Customer"
                          >
                            💰 Cairkan
                          </button>
                        )}
                        {/* Status jika tidak ada aksi */}
                        {summary.netBalance === 0 && (
                          <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg">
                            ✓ Lunas
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Tab 2: Daftar Hutang Detail */}
      {activeTab === 'list' && (
        <>
          {/* Filters */}
          <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Filter Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'partial' | 'completed')}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Sebagian</option>
                  <option value="completed">Lunas</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Total: {filteredDebts.length} hutang</span>
                <span>•</span>
                <span>Belum Lunas: {filteredDebts.filter(d => d.status !== 'completed').length}</span>
                <span>•</span>
                <span>Sudah Lunas: {filteredDebts.filter(d => d.status === 'completed').length}</span>
              </div>
            </div>
          </div>

          {/* Debt List Table */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Daftar Hutang Detail</h3>
              <p className="mt-1 text-sm text-gray-600">
                Menampilkan semua record hutang individual dengan detail pembayaran
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID & Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kontak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deskripsi Hutang
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Terbayar
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sisa Hutang
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDebts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        Tidak ada data hutang sesuai filter
                      </td>
                    </tr>
                  ) : (
                    filteredDebts.map((debt) => (
                      <tr key={debt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {debt.id.slice(0, 12)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            {(() => {
                              try {
                                const date = parseWIBTimestamp(debt.createdAt);
                                return formatWIBDate(date);
                              } catch (error) {
                                return 'Tanggal tidak valid';
                              }
                            })()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {(() => {
                              try {
                                const date = parseWIBTimestamp(debt.createdAt);
                                return date.toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) + ' WIB';
                              } catch (error) {
                                return '';
                              }
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {debt.contactName}
                              </div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                debt.contactType === 'customer' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {debt.contactType === 'customer' ? 'Customer' : 'Supplier'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {debt.description}
                          </div>
                          {debt.type === 'product' && debt.productName && (
                            <div className="text-xs text-gray-500 mt-1">
                              📦 {debt.productName} × {debt.quantity}
                            </div>
                          )}
                          {debt.notes && (
                            <div className="text-xs text-gray-400 mt-1">
                              💭 {debt.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(debt.totalAmount)}
                          </div>
                          {debt.type === 'product' && debt.amount && (
                            <div className="text-xs text-gray-500">
                              @{formatCurrency(debt.amount / (debt.quantity || 1))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium ${
                            debt.paidAmount > 0 ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {debt.paidAmount > 0 ? formatCurrency(debt.paidAmount) : '-'}
                          </div>
                          {debt.paidAmount > 0 && (
                            <div className="text-xs text-green-500">
                              {Math.round((debt.paidAmount / debt.totalAmount) * 100)}%
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium ${
                            debt.remainingAmount > 0 ? 'text-red-600' : 'text-gray-400'
                          }`}>
                            {debt.remainingAmount > 0 ? formatCurrency(debt.remainingAmount) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {debt.status === 'completed' ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✓ Lunas
                            </span>
                          ) : debt.status === 'partial' ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              ⚡ Sebagian
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            {debt.status !== 'completed' && debt.remainingAmount > 0 && (
                              <button
                                onClick={() => {
                                  const paymentAmount = prompt(
                                    `Masukkan jumlah pembayaran untuk:\n${debt.description}\n\nSisa hutang: ${formatCurrency(debt.remainingAmount)}`,
                                    debt.remainingAmount.toString()
                                  );
                                  
                                  if (paymentAmount && !isNaN(parseFloat(paymentAmount))) {
                                    const amount = parseFloat(paymentAmount);
                                    if (amount > 0) {
                                      showConfirmModal(
                                        'Konfirmasi Pembayaran',
                                        `Konfirmasi pembayaran hutang:\n\nCustomer: ${debt.contactName}\nDeskripsi: ${debt.description}\nJumlah bayar: ${formatCurrency(amount)}\n\n⚠️ Pastikan Anda sudah menerima pembayaran fisik!`,
                                        () => {
                                          handleIndividualPayment(debt, amount);
                                        },
                                        'Ya, Terima Bayar',
                                        'Batal'
                                      );
                                    } else {
                                      showAlertModal('Error', 'Jumlah pembayaran harus lebih dari 0!', 'error');
                                    }
                                  }
                                }}
                                className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                title="Terima Pembayaran"
                              >
                                💰 Bayar
                              </button>
                            )}
                            
                            {/* Button untuk melihat detail pembayaran */}
                            <button
                              onClick={() => {
                                const debtPayments = payments.filter(p => p.debtId === debt.id);
                                if (debtPayments.length === 0) {
                                  showAlertModal('Info', 'Belum ada pembayaran untuk hutang ini.', 'alert');
                                } else {
                                  const paymentList = debtPayments.map(p => 
                                    `• ${formatWIBDate(parseWIBTimestamp(p.paymentDate || p.createdAt))}: ${formatCurrency(p.amount)} ${p.notes ? `(${p.notes})` : ''}`
                                  ).join('\n');
                                  
                                  showAlertModal(
                                    `Histori Pembayaran`,
                                    `Hutang: ${debt.description}\n\nPembayaran:\n${paymentList}\n\nTotal terbayar: ${formatCurrency(debt.paidAmount)}\nSisa hutang: ${formatCurrency(debt.remainingAmount)}`,
                                    'alert'
                                  );
                                }
                              }}
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                              title="Lihat Detail Pembayaran"
                            >
                              📋 Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Debt Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            {/* Enhanced Loading Overlay */}
            {(loading || submitting) && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/95 to-indigo-50/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-blue-100/50 max-w-sm mx-4">
                  <div className="flex flex-col items-center space-y-4">
                    {/* Modern Loading Animation */}
                    <div className="relative">
                      {/* Outer Ring */}
                      <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
                      {/* Inner Spinning Ring */}
                      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 border-r-blue-500 rounded-full animate-spin"></div>
                      {/* Center Dot */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
                    </div>
                    
                    {/* Loading Text with Typing Animation */}
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Menyimpan Data</h3>
                      <div className="flex items-center justify-center space-x-1">
                        <p className="text-sm text-gray-600">Sedang memproses</p>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                      
                      {/* Progress Steps */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Validasi data</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-xs text-blue-600">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          <span>Menyimpan ke database</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span>Memperbarui summary</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Tambah Hutang Baru
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (submitting) return; // Don't close during submission
                    setShowForm(false);
                  }}
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact
                </label>
                <select
                  required
                  value={formData.contactId}
                  onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Contact</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} ({contact.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Hutang
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'money' | 'product' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="money">Hutang Uang</option>
                  <option value="product">Hutang Barang</option>
                </select>
              </div>

              {/* Field Jumlah hanya muncul jika hutang uang, atau hutang barang dengan produk & quantity sudah diisi */}
              {formData.type === 'money' || (formData.type === 'product' && formData.productId && formData.quantity) ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={formData.type === 'money' ? 'Jumlah uang' : 'Nilai barang'}
                    disabled={formData.type === 'product' && !!(formData.productId && formData.quantity)}
                  />
                  {formData.type === 'product' && formData.productId && formData.quantity && (
                    <p className="text-xs text-gray-500 mt-1">
                      Otomatis dihitung dari harga produk × quantity
                    </p>
                  )}
                </div>
              ) : null}

              {formData.type === 'product' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Produk
                    </label>
                    <select
                      value={formData.productId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Pilih Produk</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Jumlah barang"
                    />
                  </div>

                  {/* Rincian Pembayaran untuk Product */}
                  {formData.productId && formData.quantity && (() => {
                    const selectedProduct = products.find(p => p.id === formData.productId);
                    const quantity = parseInt(formData.quantity);
                    const total = selectedProduct ? selectedProduct.price * quantity : 0;
                    
                    return (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-3">📋 Rincian Pembayaran</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Produk:</span>
                            <span className="font-medium">{selectedProduct?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Harga per unit:</span>
                            <span className="font-medium">{formatCurrency(selectedProduct?.price || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="font-medium">{quantity} pcs</span>
                          </div>
                          <div className="border-t border-blue-200 pt-2">
                            <div className="flex justify-between font-bold text-blue-800">
                              <span>Total Hutang:</span>
                              <span>{formatCurrency(total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Jatuh Tempo (Opsional)
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan <span className="text-gray-400 text-xs">(Opsional)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Deskripsi hutang (kosongkan untuk otomatis)..."
                />
                
                {/* Preview Deskripsi Otomatis */}
                {(!formData.notes || formData.notes.trim() === '') && formData.contactId && formData.amount && (() => {
                  const selectedContact = contacts.find(c => c.id === formData.contactId);
                  if (!selectedContact) return null;
                  
                  let autoDescription = '';
                  if (formData.type === 'money') {
                    autoDescription = `Hutang uang ${selectedContact.name} sebesar ${formatCurrency(parseFloat(formData.amount) || 0)}`;
                  } else if (formData.type === 'product') {
                    const selectedProduct = products.find(p => p.id === formData.productId);
                    if (selectedProduct && formData.quantity) {
                      autoDescription = `Hutang barang ${selectedProduct.name} ${formData.quantity} pcs untuk ${selectedContact.name}`;
                    } else if (formData.amount) {
                      autoDescription = `Hutang barang senilai ${formatCurrency(parseFloat(formData.amount) || 0)} untuk ${selectedContact.name}`;
                    }
                  }
                  
                  return autoDescription ? (
                    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">📝 Preview deskripsi otomatis:</p>
                      <p className="text-sm text-gray-800 italic">"{autoDescription}"</p>
                    </div>
                  ) : null;
                })()}

                {/* Preview Pembayaran Otomatis dari Saldo Titip Uang */}
                {formData.contactId && formData.amount && (() => {
                  const selectedContact = contacts.find(c => c.id === formData.contactId);
                  if (!selectedContact || selectedContact.type !== 'customer') return null;
                  
                  // Cari saldo titip uang customer
                  const customerTitipUang = debts.filter(debt => 
                    debt.contactName === selectedContact.name && 
                    debt.description.includes('Titip uang') && 
                    debt.remainingAmount > 0
                  );
                  
                  const totalTitipUang = customerTitipUang.reduce((sum, debt) => sum + debt.remainingAmount, 0);
                  
                  if (totalTitipUang <= 0) return null;
                  
                  const debtAmount = parseFloat(formData.amount);
                  const amountToPay = Math.min(debtAmount, totalTitipUang);
                  const remainingDebt = debtAmount - amountToPay;
                  
                  return (
                    <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div className="h-5 w-5 text-green-500 mr-2">💰</div>
                        <h4 className="text-sm font-medium text-green-800">Pembayaran Otomatis Tersedia</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Saldo titip uang customer:</span>
                          <span className="font-medium text-green-600">{formatCurrency(totalTitipUang)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hutang baru:</span>
                          <span className="font-medium text-red-600">{formatCurrency(debtAmount)}</span>
                        </div>
                        <div className="border-t border-green-200 pt-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Akan dibayar otomatis:</span>
                            <span className="font-bold text-green-700">{formatCurrency(amountToPay)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Sisa hutang:</span>
                            <span className={`font-bold ${remainingDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {remainingDebt > 0 ? formatCurrency(remainingDebt) : 'Lunas'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Sisa saldo titip:</span>
                            <span className="font-medium text-green-600">{formatCurrency(totalTitipUang - amountToPay)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-green-100 rounded text-xs text-green-700">
                        ✅ Sistem akan otomatis memotong saldo titip uang untuk membayar hutang ini
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    if (submitting) return; // Don't close during submission
                    setShowForm(false);
                  }}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || submitting}
                  className={`px-6 py-3 text-sm font-medium text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                    loading || submitting
                      ? 'bg-blue-400 cursor-not-allowed opacity-75'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {(loading || submitting) ? (
                      <>
                        {/* Simplified Button Loading Animation */}
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Simpan Hutang</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Payment Form Modal */}
      {showBulkPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Terima Pembayaran dari Customer
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkPaymentForm(false);
                    setBulkPaymentData({
                      customerName: '',
                      paymentType: 'money',
                      moneyAmount: '',
                      productId: '',
                      productQuantity: '',
                      notes: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!bulkPaymentData.customerName) {
                showAlertModal('Error Validasi', 'Pilih customer terlebih dahulu', 'error');
                return;
              }
              if (bulkPaymentData.paymentType === 'money') {
                if (!bulkPaymentData.moneyAmount || parseFloat(bulkPaymentData.moneyAmount) <= 0) {
                  showAlertModal('Error Validasi', 'Masukkan jumlah pembayaran uang yang valid', 'error');
                  return;
                }
              } else if (bulkPaymentData.paymentType === 'product') {
                if (!bulkPaymentData.productId || !bulkPaymentData.productQuantity || parseInt(bulkPaymentData.productQuantity) <= 0) {
                  showAlertModal('Error Validasi', 'Pilih produk dan jumlah yang valid', 'error');
                  return;
                }
              }
              setLoading(true);
              try {
                const now = getWIBTimestamp();
                
                if (true) { // ALWAYS TERIMA MODE ONLY
                  // TERIMA: Customer membayar hutang atau memberikan uang/barang ke toko
                  if (bulkPaymentData.paymentType === 'money') {
                    // Terima uang dari customer - gunakan logika pembayaran hutang yang sudah ada
                    await handleBulkPayment(e);
                    return;
                  } else if (bulkPaymentData.paymentType === 'product') {
                    // Terima barang dari customer (misalnya: return barang, atau customer bayar hutang dengan barang)
                    const customerDebts = debts.filter(debt =>
                      debt.contactName === bulkPaymentData.customerName &&
                      debt.type === 'product' &&
                      debt.status !== 'completed' &&
                      debt.productId === bulkPaymentData.productId &&
                      !debt.description.includes('Titip uang')
                    );
                    
                    console.log(`[DEBUG CUSTOMER DEBTS] Found customer debts:`, {
                      customerName: bulkPaymentData.customerName,
                      productId: bulkPaymentData.productId,
                      totalDebts: debts.length,
                      filteredDebts: customerDebts.length,
                      customerDebts: customerDebts.map(debt => ({
                        id: debt.id,
                        totalAmount: debt.totalAmount,
                        quantity: debt.quantity,
                        status: debt.status,
                        description: debt.description
                      }))
                    });
                    
                    if (customerDebts.length === 0) {
                      // Jika tidak ada hutang barang, buat record "titip barang"
                      const selectedProduct = products.find(p => p.id === bulkPaymentData.productId);
                      const qty = parseInt(bulkPaymentData.productQuantity);
                      const totalValue = selectedProduct ? selectedProduct.cost * qty : 0; // Gunakan cost untuk terima barang
                      
                      const titipBarangRow = [
                        `DEBT_${Date.now()}_TITIP_BARANG`,
                        contacts.find(c => c.name === bulkPaymentData.customerName)?.id || '',
                        bulkPaymentData.customerName,
                        'customer',
                        'product',
                        `Titip barang dari customer: ${selectedProduct?.name} ${qty} pcs`,
                        totalValue,
                        bulkPaymentData.productId,
                        selectedProduct?.name || '',
                        qty,
                        'completed',
                        totalValue,
                        0,
                        totalValue,
                        '',
                        now,
                        now,
                        `Customer titip barang: ${bulkPaymentData.notes}`
                      ];
                      
                      await GoogleSheetsService.appendToSheet('Debts', [titipBarangRow]);
                      showAlertModal('Success', `Berhasil menerima titip barang dari customer!\n\nBarang: ${selectedProduct?.name}\nJumlah: ${qty} pcs\nNilai: ${formatCurrency(totalValue)}`, 'success');
                    } else {
                      // Ada hutang barang, proses pembayaran hutang dengan barang
                      let qtyToPay = parseInt(bulkPaymentData.productQuantity);
                      const paymentsToCreate = [];
                      const debtsToUpdate = [];
                      
                      console.log(`[DEBUG PRODUCT PAYMENT] Starting product payment:`, {
                        customerName: bulkPaymentData.customerName,
                        productId: bulkPaymentData.productId,
                        qtyToPay: qtyToPay,
                        customerDebts: customerDebts.length
                      });
                      
                      for (const debt of customerDebts) {
                        if (qtyToPay <= 0) break;
                        
                        console.log(`[DEBUG PRODUCT PAYMENT] Processing debt:`, {
                          debtId: debt.id,
                          debtAmount: debt.amount,
                          debtTotalAmount: debt.totalAmount,
                          debtQuantity: debt.quantity,
                          debtRemainingAmount: debt.remainingAmount
                        });
                        
                        const qtyApply = Math.min(qtyToPay, debt.quantity || 0);
                        
                        // Hitung amount berdasarkan total amount hutang dibagi quantity
                        // Untuk hutang produk, debt.amount = 0, gunakan totalAmount
                        let pricePerUnit = 0;
                        if (debt.totalAmount && debt.quantity && debt.quantity > 0) {
                          pricePerUnit = parseFloat((debt.totalAmount / debt.quantity).toString());
                        } else {
                          // Fallback ke harga produk cost (untuk pembayaran dengan barang yang sama)
                          const selectedProduct = products.find(p => p.id === bulkPaymentData.productId);
                          pricePerUnit = parseFloat((selectedProduct?.cost || 0).toString());
                        }
                        
                        const amountToApply = parseFloat((pricePerUnit * qtyApply).toString());
                        
                        console.log(`[DEBUG PRODUCT PAYMENT] Calculation:`, {
                          qtyApply,
                          pricePerUnit,
                          amountToApply,
                          calculation: `${pricePerUnit} × ${qtyApply} = ${amountToApply}`,
                          amountType: typeof amountToApply,
                          isValidNumber: !isNaN(amountToApply) && isFinite(amountToApply)
                        });
                        
                        if (amountToApply <= 0 || isNaN(amountToApply) || !isFinite(amountToApply)) {
                          console.log(`[DEBUG PRODUCT PAYMENT] ERROR: amountToApply is invalid (${amountToApply}), skipping debt ${debt.id}`);
                          continue;
                        }
                        
                        const newPaidAmount = debt.paidAmount + amountToApply;
                        const newRemainingAmount = Math.max(0, debt.remainingAmount - amountToApply);
                        const newQty = Math.max(0, (debt.quantity || 0) - qtyApply);
                        
                        console.log(`[DEBUG PRODUCT PAYMENT] Final validation:`, {
                          amountToApply,
                          willCreatePayment: amountToApply > 0,
                          newPaidAmount,
                          newRemainingAmount,
                          newStatus: newRemainingAmount <= 0 ? 'completed' : 'partial'
                        });
                        
                        // Pastikan product name untuk logging
                        const productName = products.find(p => p.id === bulkPaymentData.productId)?.name || 'Unknown Product';
                        
                        // Struktur sesuai dengan sheet DebtPayments:
                        // A=ID, B=DebtID, C=Type, D=Amount, E=Quantity, F=ProductName, G=PaymentDate, H=Notes, I=CreatedAt
                        const paymentRecord = [
                          `payment_${Date.now()}_${debt.id}`,           // A: ID
                          debt.id,                                      // B: DebtID  
                          'product',                                    // C: Type
                          parseFloat(amountToApply.toString()),        // D: Amount ← PASTIKAN INI NUMBER!
                          parseInt(qtyApply.toString()),               // E: Quantity
                          productName,                                 // F: ProductName  
                          formatWIBDate(new Date()),                   // G: PaymentDate
                          `Terima pembayaran hutang barang ${qtyApply} pcs - ${bulkPaymentData.notes || ''}`, // H: Notes
                          now                                          // I: CreatedAt
                        ];
                        
                        paymentsToCreate.push(paymentRecord);
                        
                        console.log(`[DEBUG PRODUCT PAYMENT] Payment record created:`, {
                          ID: paymentRecord[0],
                          DebtID: paymentRecord[1], 
                          Type: paymentRecord[2],
                          Amount: paymentRecord[3], // ← PERIKSA INI!
                          Quantity: paymentRecord[4],
                          ProductName: paymentRecord[5],
                          PaymentDate: paymentRecord[6],
                          Notes: paymentRecord[7],
                          CreatedAt: paymentRecord[8]
                        });
                        
                        const newStatus = newRemainingAmount <= 0 ? 'completed' : 'partial';
                        const debtIndex = debts.findIndex(d => d.id === debt.id);
                        if (debtIndex !== -1) {
                          debtsToUpdate.push({
                            index: debtIndex,
                            data: {
                              ...debt,
                              status: newStatus,
                              paidAmount: newPaidAmount,
                              remainingAmount: newRemainingAmount,
                              quantity: newQty,
                              updatedAt: now
                            }
                          });
                        }
                        qtyToPay -= qtyApply;
                      }
                      
                      if (paymentsToCreate.length > 0) {
                        console.log(`[DEBUG PRODUCT PAYMENT] Sending ${paymentsToCreate.length} payments to DebtPayments sheet:`, paymentsToCreate);
                        console.log(`[DEBUG PRODUCT PAYMENT] First payment Amount check:`, paymentsToCreate[0][3]);
                        
                        // Tambahan debug untuk memastikan struktur data benar
                        paymentsToCreate.forEach((payment, index) => {
                          console.log(`[DEBUG PRODUCT PAYMENT] Payment ${index + 1} structure:`, {
                            ID: payment[0],
                            DebtID: payment[1],
                            Type: payment[2],
                            Amount: payment[3],
                            AmountType: typeof payment[3],
                            AmountValue: payment[3],
                            Quantity: payment[4],
                            ProductName: payment[5],
                            PaymentDate: payment[6],
                            Notes: payment[7],
                            CreatedAt: payment[8]
                          });
                        });
                        
                        const result = await GoogleSheetsService.appendToSheet('DebtPayments', paymentsToCreate);
                        console.log(`[DEBUG PRODUCT PAYMENT] Google Sheets append result:`, result);
                        
                        if (result.success) {
                          console.log(`[DEBUG PRODUCT PAYMENT] Successfully sent to DebtPayments sheet`);
                        } else {
                          console.error(`[DEBUG PRODUCT PAYMENT] Failed to send to DebtPayments sheet`);
                        }
                      } else {
                        console.log(`[DEBUG PRODUCT PAYMENT] No payments to create!`);
                      }
                      for (const debtUpdate of debtsToUpdate) {
                        const updateRow = [
                          debtUpdate.data.id,
                          debtUpdate.data.contactId,
                          debtUpdate.data.contactName,
                          debtUpdate.data.contactType,
                          debtUpdate.data.type,
                          debtUpdate.data.description,
                          debtUpdate.data.amount,
                          debtUpdate.data.productId,
                          debtUpdate.data.productName,
                          debtUpdate.data.quantity,
                          debtUpdate.data.status,
                          debtUpdate.data.totalAmount,
                          debtUpdate.data.paidAmount,
                          debtUpdate.data.remainingAmount,
                          debtUpdate.data.dueDate,
                          debtUpdate.data.createdAt,
                          debtUpdate.data.updatedAt,
                          debtUpdate.data.notes
                        ];
                        await GoogleSheetsService.updateSheetRow('Debts', debtUpdate.index + 2, updateRow);
                      }
                      showAlertModal('Success', 'Pembayaran hutang barang berhasil diterima!', 'success');
                    }
                  }
                }
                
                await loadData();
                
                setBulkPaymentData({
                  customerName: '',
                  paymentType: 'money',
                  moneyAmount: '',
                  productId: '',
                  productQuantity: '',
                  notes: ''
                });
                setShowBulkPaymentForm(false);
              } catch (error) {
                console.error('Error processing payment:', error);
                showAlertModal('Error', 'Gagal memproses transaksi!', 'error');
              } finally {
                setLoading(false);
              }
            }} className="px-6 py-4 space-y-6">
              
              {/* Penting: Pilih tipe pembayaran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Pembayaran <span className="text-red-500">*</span></label>
                <select
                  value={bulkPaymentData.paymentType}
                  onChange={e => setBulkPaymentData({ ...bulkPaymentData, paymentType: e.target.value as 'money' | 'product' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="money">Uang</option>
                  <option value="product">Barang</option>
                </select>
              </div>
              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer <span className="text-red-500">*</span></label>
                <select
                  required
                  value={bulkPaymentData.customerName}
                  onChange={e => {
                    const customerName = e.target.value;
                    // Auto-update deskripsi ketika customer dipilih
                    const autoNotes = customerName 
                      ? `Terima pembayaran dari ${customerName}` // Always terima mode
                      : '';
                    
                    setBulkPaymentData({ 
                      ...bulkPaymentData, 
                      customerName,
                      notes: autoNotes
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih customer...</option>
                  {contacts.filter(c => c.type === 'customer').map(contact => (
                    <option key={contact.id} value={contact.name}>{contact.name}</option>
                  ))}
                </select>
              </div>
              {/* Field dinamis sesuai tipe pembayaran */}
              {bulkPaymentData.paymentType === 'money' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Diterima <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                    <input
                      type="number"
                      required
                      value={bulkPaymentData.moneyAmount}
                      onChange={e => setBulkPaymentData({ ...bulkPaymentData, moneyAmount: e.target.value })}
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Masukkan jumlah uang yang diterima dari customer</p>
                  {/* Rincian pembayaran uang */}
                  {bulkPaymentData.moneyAmount && parseFloat(bulkPaymentData.moneyAmount) > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Total diterima:</span>
                        <span className="font-bold">{formatCurrency(parseFloat(bulkPaymentData.moneyAmount))}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Produk <span className="text-red-500">*</span></label>
                    <select
                      value={bulkPaymentData.productId}
                      onChange={e => setBulkPaymentData({ ...bulkPaymentData, productId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Pilih Produk</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.cost)} (harga beli)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={bulkPaymentData.productQuantity}
                      onChange={e => setBulkPaymentData({ ...bulkPaymentData, productQuantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Jumlah barang"
                    />
                  </div>
                  {/* Rincian pembayaran barang */}
                  {bulkPaymentData.productId && bulkPaymentData.productQuantity && parseInt(bulkPaymentData.productQuantity) > 0 && (() => {
                    const selectedProduct = products.find(p => p.id === bulkPaymentData.productId);
                    const qty = parseInt(bulkPaymentData.productQuantity);
                    // Gunakan cost untuk terima, price untuk berikan
                    const priceToUse = selectedProduct?.cost || 0;
                    const total = selectedProduct ? priceToUse * qty : 0;
                    return (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Produk:</span>
                          <span className="font-bold">{selectedProduct?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Harga beli per unit:</span>
                          <span>{formatCurrency(priceToUse)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Quantity:</span>
                          <span>{qty} pcs</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t border-blue-200 pt-2 mt-2">
                          <span>Total diterima:</span>
                          <span>{formatCurrency(total)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={bulkPaymentData.notes}
                  onChange={e => setBulkPaymentData({ ...bulkPaymentData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Catatan penerimaan pembayaran..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkPaymentForm(false);
                    setBulkPaymentData({
                      customerName: '',
                      paymentType: 'money',
                      moneyAmount: '',
                      productId: '',
                      productQuantity: '',
                      notes: ''
                    });
                  }}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
                >
                  Konfirmasi Penerimaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalState.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4">
              <h3 className={`text-lg font-medium mb-4 ${
                modalState.type === 'success' ? 'text-green-600' :
                modalState.type === 'error' ? 'text-red-600' :
                modalState.type === 'confirm' ? 'text-blue-600' :
                'text-gray-900'
              }`}>
               
                {modalState.title}
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line mb-6">
                {modalState.message}
              </p>
              <div className="flex justify-end space-x-3">
                {modalState.type === 'confirm' && modalState.onCancel && (
                  <button
                    onClick={modalState.onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {modalState.cancelText || 'Batal'}
                  </button>
                )}
                <button
                  onClick={modalState.onConfirm}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    modalState.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                    modalState.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                    modalState.type === 'confirm' ? 'bg-blue-600 hover:bg-blue-700' :
                    'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {modalState.confirmText || 'OK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debts;
