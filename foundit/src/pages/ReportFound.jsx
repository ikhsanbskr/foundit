import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import P5Select from "../components/ui/P5Select";
import P5DatePicker from "../components/ui/P5DatePicker";
import axios from "axios";
import imageCompression from 'browser-image-compression';

// Using env for backend URL
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ReportFound = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const editDataRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [keptImages, setKeptImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(null);
  const fileInputRef = useRef(null);

  // API State
  const [categories, setCategories] = useState([]);
  const [specifics, setSpecifics] = useState([]);
  const [banks, setBanks] = useState([]);
  
  const [selectedCat, setSelectedCat] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  
  // Form State
  const [itemName, setItemName] = useState("");
  const [locationFound, setLocationFound] = useState("");
  const [description, setDescription] = useState("");
  const [verificationDesc, setVerificationDesc] = useState("");
  const [bountyAmount, setBountyAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'success', title: '', message: '', instruction: '' });

  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);

  useEffect(() => {
    // Fetch Main Categories
    axios.get(`${API_BASE}/master/categories`)
      .then(res => {
        if (res.data?.data) {
          const formatted = res.data.data.map(c => ({ value: c.id.toString(), label: c.category_name }));
          setCategories(formatted);
        }
      })
      .catch(err => console.error("Failed to fetch categories:", err))
      .finally(() => setLoadingCats(false));

    // Fetch Banks
    axios.get(`${API_BASE}/master/banks`)
      .then(res => {
        if (res.data?.data) {
          const formatted = res.data.data.map(b => ({ value: b.id.toString(), label: b.bank_code }));
          setBanks(formatted);
        }
      })
      .catch(err => console.error("Failed to fetch banks:", err))
      .catch(err => console.error("Failed to fetch banks:", err))
      .finally(() => setLoadingBanks(false));

    // If Edit Mode, fetch report data
    if (isEditMode) {
      axios.get(`${API_BASE}/reports/${id}`)
        .then(res => {
          if (res.data?.data) {
            const data = res.data.data;
            editDataRef.current = data;
            setSelectedCat(data.category_id?.toString() || "");
            setItemName(data.item_name || "");
            setLocationFound(data.location_found || "");
            setDescription(data.description || "");
            setVerificationDesc(data.verification_description || "");
            setBountyAmount(data.bounty_amount || "");
            setSelectedBank(data.bank_id?.toString() || "");
            setAccountNumber(data.account_number || "");
            setEventTime(data.event_time ? data.event_time.replace(' ', 'T').substring(0, 16) : "");
            if (data.images) {
              setKeptImages(data.images);
            }
          }
        })
        .catch(err => {
          console.error("Failed to fetch report:", err);
          alert("Gagal mengambil data laporan.");
          navigate("/my-posts");
        });
    }
  }, [id, navigate, isEditMode]);

  useEffect(() => {
    // Fetch Specific Categories when Main Category changes
    if (!selectedCat) {
      setSpecifics([]);
      setSelectedSpec("");
      return;
    }
    setLoadingSpecs(true);
    axios.get(`${API_BASE}/master/categories/details/${selectedCat}`)
      .then(res => {
        if (res.data?.data) {
          const formatted = res.data.data.map(s => ({ value: s.id.toString(), label: s.detail_name }));
          setSpecifics(formatted);
          if (editDataRef.current && editDataRef.current.category_id?.toString() === selectedCat) {
            setSelectedSpec(editDataRef.current.category_detail_id?.toString() || "");
          }
        }
      })
      .catch(err => console.error("Failed to fetch specifics:", err))
      .finally(() => setLoadingSpecs(false));
  }, [selectedCat]);

  const addFiles = (incoming) => {
    const newFiles = Array.from(incoming).map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      id: Math.random().toString(36).slice(2),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    if (e.target.files)    addFiles(e.target.files);
    e.target.value = null; // reset input
  };

  const allImages = [
    ...keptImages.map(img => ({ ...img, isKept: true, fileUrl: img.url })),
    ...files.map(f => ({ ...f, isNew: true, fileUrl: f.url }))
  ];

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCat || !selectedSpec || !itemName || !locationFound || !description || !eventTime) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'MISSION FAILED',
        message: 'Pastikan form utama (Kategori, Nama, Waktu, Lokasi, Deskripsi) sudah terisi!',
        instruction: ''
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("category_id", selectedCat);
    formData.append("category_detail_id", selectedSpec);
    formData.append("item_name", itemName);
    formData.append("location_found", locationFound);
    formData.append("description", description);
    formData.append("event_time", eventTime);
    
    if (verificationDesc) formData.append("verification_description", verificationDesc);
    if (bountyAmount) formData.append("bounty_amount", bountyAmount);
    if (selectedBank) formData.append("bank_id", selectedBank);
    if (accountNumber) formData.append("account_number", accountNumber);

    try {
      // Compress Images on Frontend
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      const compressedFiles = await Promise.all(
        files.map(async (f) => {
          try {
            return await imageCompression(f.file, options);
          } catch (error) {
            console.error("Compression error:", error);
            return f.file; // Fallback to original if compression fails
          }
        })
      );

      compressedFiles.forEach((file) => {
        formData.append("images[]", file);
      });

      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (isEditMode) {
        keptImages.forEach(img => formData.append("kept_images[]", img.id));
        const response = await axios.post(`${API_BASE}/reports/${id}`, formData, { headers });
        if (response.status === 200) {
          setModalConfig({
            isOpen: true,
            type: 'success',
            title: 'UPDATE SUCCESS',
            message: 'Mission Report: Berhasil diperbarui!',
            instruction: ''
          });
          setTimeout(() => navigate('/my-posts'), 1500);
        }
      } else {
        const response = await axios.post(`${API_BASE}/reports/found`, formData, { headers });
        if (response.status === 201) {
          setModalConfig({
            isOpen: true,
            type: 'success',
            title: 'MISSION ACCOMPLISHED',
            message: 'Mission Report: Tersubmit dengan Sukses!',
            instruction: 'INSTRUKSI: Barang temuan ini harus segera diserahkan ke Pusat Penerimaan Barang terdekat untuk dilakukan verifikasi kepemilikan.'
          });
          
          // Reset form
          setSelectedCat("");
          setSelectedSpec("");
          setSelectedBank("");
          setItemName("");
          setLocationFound("");
          setDescription("");
          setVerificationDesc("");
          setBountyAmount("");
          setAccountNumber("");
          setEventTime("");
          setFiles([]);
        }
      }
    } catch (err) {
      console.error(err);
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'MISSION FAILED',
        message: err.response?.data?.messages?.error || "Gagal submit report.",
        instruction: ''
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  return (
    <>
      <nav className="max-w-4xl mx-auto mb-8 flex items-center gap-2 font-black uppercase text-[12px] tracking-tighter text-white/40">
        <Link className="hover:text-primary" to="/">
          HOME
        </Link>
        <span className="text-primary">/</span>
        <Link className="hover:text-primary" to="/my-posts">
          MY POSTS
        </Link>
        <span className="text-primary">/</span>
        <span className="text-white">{isEditMode ? 'EDIT TEMUAN' : 'LAPOR TEMUAN'}</span>
      </nav>

      <div className="max-w-4xl mx-auto">
        {/* Header Banner */}
        <div className="bg-primary text-white p-6 border-8 border-black p5-card-shadow mb-12 -rotate-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="font-black uppercase text-3xl md:text-4xl stencil-text leading-none text-black">
            {isEditMode ? 'MISSION UPDATE' : 'MISSION REPORT'}
          </div>
          <div className="flex items-center gap-3 bg-black px-4 py-2 p5-skew shadow-[5px_5px_0px_#fff]">
            <span className="text-primary font-bold text-xs uppercase tracking-widest">
              AGENT:
            </span>
            <span className="text-white font-black uppercase">IKHSAN</span>
            <span className="material-symbols-outlined text-primary text-sm animate-pulse">
              radio_button_checked
            </span>
          </div>
        </div>

        <div className="bg-white border-8 border-black p-8 md:p-12 p5-card-shadow relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary rotate-45 opacity-10"></div>
          <div className="absolute -left-10 bottom-40 w-32 h-8 bg-black -skew-x-12 opacity-5"></div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-12">
            {/* ── 01 EVIDENCE SCANNER ── */}
            <div>
              <h2 className="font-black text-2xl md:text-3xl uppercase mb-6 flex items-center gap-3 text-black">
                <span className="bg-primary text-white px-3 py-1 -skew-x-12 inline-block">
                  01
                </span>
                EVIDENCE SCANNER
              </h2>

              {/* Drop Zone */}
              <div
                className={`border-4 border-dashed transition-all duration-300 cursor-pointer p-10 text-center shadow-[8px_8px_0px_#d10000] relative overflow-hidden ${isDragging ? "bg-black border-primary" : "bg-gray-100 border-black hover:bg-black hover:border-primary group"}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <div className="flex flex-col items-center gap-3 text-center px-4">
                  <span
                    className={`material-symbols-outlined text-5xl transition-all duration-300 ${isDragging ? "text-primary scale-110" : "text-primary group-hover:text-white group-hover:scale-110"}`}
                  >
                    cloud_upload
                  </span>
                  <h3
                    className={`font-black text-xl uppercase leading-tight ${isDragging ? "text-white" : "text-black group-hover:text-white"}`}
                  >
                    {isDragging
                      ? "RELEASE TO UPLOAD"
                      : "AMBIL FOTO / PILIH DARI GALERI"}
                  </h3>
                  <p
                    className={`font-bold text-xs uppercase tracking-widest ${isDragging ? "text-primary" : "text-gray-400 group-hover:text-primary"}`}
                  >
                    (BISA DILAKUKAN BERKALI-KALI UNTUK MENAMBAH BANYAK FOTO)
                  </p>
                </div>
              </div>

              {/* File Previews */}
              {(allImages.length > 0) && (
                <div className="mt-8 border-4 border-black p-4 relative group">
                  <div className="absolute -top-3 left-4 bg-black text-white px-2 font-black text-xs uppercase tracking-widest">
                    EVIDENCE PREVIEW
                  </div>
                  <div className="relative aspect-video bg-[#111] overflow-hidden">
                    <img
                      src={allImages[previewIndex || 0]?.fileUrl?.startsWith('http') ? new URL(allImages[previewIndex || 0].fileUrl).pathname : allImages[previewIndex || 0]?.fileUrl}
                      alt="preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>

                    {/* Delete button */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const img = allImages[previewIndex || 0];
                          if (img.isKept) {
                            setKeptImages(keptImages.filter(k => k.id !== img.id));
                          } else {
                            setFiles(files.filter(f => f.id !== img.id));
                          }
                          setPreviewIndex(0);
                        }}
                        className="bg-primary text-white font-black text-xs uppercase px-3 py-2 border-2 border-white shadow-[3px_3px_0px_#000] hover:scale-105 transition-transform flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">
                          delete
                        </span>
                        HAPUS
                      </button>
                    </div>
                  </div>

                  {/* Thumbnails */}
                  <div
                    className="flex gap-3 mt-4 overflow-x-auto max-w-full pb-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {allImages.map((f, i) => (
                      <div
                        key={f.id}
                        onClick={() => setPreviewIndex(i)}
                        className={`w-16 h-16 flex-shrink-0 border-4 cursor-pointer overflow-hidden transition-all relative ${i === (previewIndex || 0) ? "border-primary shadow-[3px_3px_0px_#fff]" : "border-white/30 opacity-50 hover:opacity-100 hover:border-primary"}`}
                      >
                        <img
                          src={f.fileUrl?.startsWith('http') ? new URL(f.fileUrl).pathname : f.fileUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {f.isKept && (
                           <div className="absolute bottom-0 right-0 bg-primary w-3 h-3"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Nav arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewIndex(
                            ((previewIndex || 0) - 1 + allImages.length) % allImages.length,
                          );
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black border-4 border-white text-white p-3 hover:bg-primary hover:border-primary transition-all shadow-[4px_4px_0px_#d10000]"
                      >
                        <span className="material-symbols-outlined text-3xl">
                          chevron_left
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewIndex((previewIndex + 1) % allImages.length);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black border-4 border-white text-white p-3 hover:bg-primary hover:border-primary transition-all shadow-[4px_4px_0px_#d10000]"
                      >
                        <span className="material-symbols-outlined text-3xl">
                          chevron_right
                        </span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── 02 OBJECTIVE DETAILS ── */}
            <div>
              <h2 className="font-black text-2xl md:text-3xl uppercase mb-6 flex items-center gap-3 text-black">
                <span className="bg-black text-white px-3 py-1 skew-x-12 inline-block">
                  02
                </span>
                OBJECTIVE DETAILS
              </h2>
              <div className="space-y-6 border-l-8 border-primary pl-6 -ml-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-black text-sm uppercase text-black mb-2 tracking-widest">
                      Kategori Utama <span className="text-primary">*</span>
                      {loadingCats && <span className="ml-2 text-xs text-gray-500 lowercase">(loading...)</span>}
                    </label>
                    <P5Select
                      options={categories}
                      value={selectedCat}
                      onChange={setSelectedCat}
                      placeholder="SELECT CATEGORY..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-black text-sm uppercase text-black mb-2 tracking-widest">
                      Jenis Barang <span className="text-primary">*</span>
                      {loadingSpecs && <span className="ml-2 text-xs text-gray-500 lowercase">(loading...)</span>}
                    </label>
                    <P5Select
                      options={specifics}
                      value={selectedSpec}
                      onChange={setSelectedSpec}
                      placeholder={selectedCat ? "SPECIFIC CATEGORY..." : "PILIH KATEGORI UTAMA DULU..."}
                      required
                      disabled={!selectedCat || specifics.length === 0}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-sm uppercase text-black mb-2 tracking-widest">
                    Nama Barang <span className="text-primary">*</span>
                  </label>
                  <input
                    required
                    className="w-full bg-white border-4 border-black shadow-[6px_6px_0px_#d10000] p-4 text-black font-bold uppercase placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-primary transition-colors"
                    placeholder="NAMA BARANG YANG HILANG..."
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-black text-sm uppercase text-black mb-2 tracking-widest">
                      Waktu Ditemukan <span className="text-primary">*</span>
                    </label>
                    <P5DatePicker
                      required
                      value={eventTime}
                      onChange={setEventTime}
                    />
                  </div>

                  <div>
                    <label className="block font-black text-sm uppercase text-black mb-2 tracking-widest">
                      Lokasi Terakhir <span className="text-primary">*</span>
                    </label>
                    <input
                      required
                      className="w-full bg-white border-4 border-black shadow-[6px_6px_0px_#d10000] p-4 text-black font-bold uppercase placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-primary transition-colors"
                      placeholder="PERKIRAAN LOKASI..."
                      type="text"
                      value={locationFound}
                      onChange={(e) => setLocationFound(e.target.value)}
                    />
                  </div>
                </div>



                <div>
                  <label className="block font-black text-sm uppercase text-black mb-2 tracking-widest">
                    Deskripsi Barang <span className="text-primary">*</span>
                  </label>
                  <textarea
                    required
                    className="w-full bg-white border-4 border-black shadow-[6px_6px_0px_#d10000] p-4 text-black font-bold uppercase placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-primary transition-colors resize-none"
                    placeholder="DESKRIPSI FISIK, WARNA, MERK, ATAU CIRI UMUM YANG BISA DIKENALI..."
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* ── 03 SECRET KEYS ── */}
            <div>
              <h2 className="font-black text-2xl md:text-3xl uppercase mb-6 flex items-center gap-3 text-black">
                <span className="bg-black text-white px-3 py-1 skew-x-12 inline-block">
                  03
                </span>
                VALIDASI KEPEMILIKAN (OPSIONAL)
              </h2>
              <div className="space-y-6 border-l-8 border-primary pl-6 -ml-2">
                <div className="bg-primary/10 border-4 border-primary p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-primary text-white px-4 py-2 flex items-center gap-2 font-black text-[10px] uppercase border-l-4 border-b-4 border-black">
                    <span className="material-symbols-outlined text-sm">
                      shield
                    </span>{" "}
                    ENCRYPTED
                  </div>
                  <label className="block font-black text-sm uppercase text-black mb-2 tracking-widest mt-4">
                    Bukti Kepemilikan Rahasia{" "}
                    <span className="text-primary">*</span>
                  </label>
                  <p className="text-sm font-bold text-black/60 mb-4">
                    Sebutkan ciri unik yang hanya diketahui oleh pemilik asli.
                    Data ini dirahasiakan dan digunakan petugas untuk validasi
                    saat serah terima.
                  </p>
                  <textarea
                    className="w-full bg-white border-4 border-black shadow-[6px_6px_0px_#d10000] p-4 text-black font-bold uppercase placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-primary transition-colors resize-none"
                    placeholder="Masukkan ciri khusus (misal: isi dompet, cacat pada benda, wallpaper..."
                    rows="4"
                    value={verificationDesc}
                    onChange={(e) => setVerificationDesc(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-black text-2xl md:text-3xl uppercase mb-6 flex items-center gap-3 text-black">
                <span className="bg-black text-white px-3 py-1 skew-x-12 inline-block">
                  04
                </span>
                NOMOR REKENING (OPSIONAL)
              </h2>
              <div className="space-y-6 border-l-8 border-primary pl-6 -ml-2">
                <div className="bg-primary/10 border-4 border-primary p-6 relative">
                  <p className="text-sm font-bold text-black/60 mb-4">
                   Jika Anda bersedia menerima imbalan (bounty) dari pemilik barang, silakan masukkan detail rekening Anda di bawah ini. Jika tidak, Anda bisa mengosongkan bagian ini.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-black text-sm uppercase text-black mb-2 tracking-widest">
                        Jenis Bank
                        {loadingBanks && <span className="ml-2 text-xs text-gray-500 lowercase">(loading...)</span>}
                      </label>
                      <P5Select
                        options={banks}
                        value={selectedBank}
                        onChange={setSelectedBank}
                        placeholder="SELECT BANK..."
                      />
                    </div>
                    <div>
                      <label className="block font-black text-sm uppercase text-black mb-2 tracking-widest">
                        Nomor Rekening
                      </label>
                      <input
                        className="w-full bg-white border-4 border-black shadow-[6px_6px_0px_#d10000] p-4 text-black font-bold uppercase placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-primary transition-colors"
                        placeholder="NOMOR REKENING..."
                        type="number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Clearance */}
            <div className="bg-black p-6 border-4 border-primary shadow-[8px_8px_0px_theme(colors.black)] transform rotate-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="material-symbols-outlined text-primary text-4xl">
                  vpn_key
                </span>
                <div>
                  <h4 className="font-black text-white text-lg uppercase tracking-wider">
                    SECURITY CLEARANCE
                  </h4>
                  <p className="text-primary font-bold text-xs uppercase">
                    Verification required for submission
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  required
                  className="w-6 h-6 border-4 border-white bg-black checked:bg-primary checked:border-primary appearance-none cursor-pointer relative after:content-[''] after:absolute after:inset-1 after:bg-white after:hidden checked:after:block transition-colors"
                  id="agreement"
                  type="checkbox"
                />
                <label
                  className="font-bold text-sm text-white uppercase cursor-pointer"
                  htmlFor="agreement"
                >
                  SAYA MENYATAKAN BAHWA DATA YANG DILAPORKAN ADALAH BENAR DAN
                  VALID. <span className="text-primary">*</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-6 pt-8 border-t-8 border-black">
              <button
                className={`flex-1 py-6 ${isSubmitting ? 'bg-gray-500' : 'bg-primary hover:bg-black group'} text-white font-black text-2xl md:text-3xl uppercase tracking-widest border-4 border-black p5-button transition-colors rotate-1 flex items-center justify-center gap-3`}
                type="submit"
                disabled={isSubmitting}
              >
                <span className={`material-symbols-outlined text-4xl group-hover:rotate-90 transition-transform duration-300 ${isSubmitting ? 'animate-spin' : ''}`}>
                  {isSubmitting ? 'sync' : 'play_arrow'}
                </span>
                {isSubmitting ? 'UPLOADING...' : isEditMode ? 'UPDATE DATA' : 'MISSION START'}
              </button>
              <button
                className="w-full md:w-1/3 py-6 bg-white text-black font-black text-xl uppercase tracking-widest border-4 border-black p5-button hover:bg-gray-200 transition-colors -rotate-1"
                type="button"
                onClick={() => navigate('/my-posts')}
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Persona Alert Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal}></div>
          <div className={`relative z-10 w-full max-w-md bg-white border-8 border-black p-8 shadow-[12px_12px_0px_#000] transform -rotate-2 ${modalConfig.type === 'error' ? 'shadow-[12px_12px_0px_#d10000]' : ''}`}>
            
            <div className={`absolute -top-6 -left-6 px-4 py-2 border-4 border-black font-black uppercase text-2xl rotate-3 shadow-[4px_4px_0px_#000] ${modalConfig.type === 'error' ? 'bg-primary text-white' : 'bg-green-500 text-black'}`}>
              {modalConfig.title}
            </div>

            <div className="mt-8">
              <p className="font-bold text-black text-lg uppercase leading-tight mb-6">
                {modalConfig.message}
              </p>
              
              {modalConfig.instruction && (
                <div className="bg-primary text-white p-4 font-bold text-sm uppercase mb-6 border-l-4 border-black p5-skew flex items-start gap-3">
                  <span className="material-symbols-outlined shrink-0 text-2xl">campaign</span>
                  <p>{modalConfig.instruction}</p>
                </div>
              )}
            </div>

            <button 
              onClick={closeModal}
              className={`w-full py-4 font-black uppercase text-xl border-4 border-black p5-button hover:bg-black hover:text-white transition-colors ${modalConfig.type === 'error' ? 'bg-primary text-white' : 'bg-black text-white'}`}
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportFound;
