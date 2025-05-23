import { NextRequest, NextResponse } from 'next/server';

// Sederhana, simpan QR terakhir di memori server (perlu solusi state management yang lebih baik untuk produksi)
let latestQrCode: string | null = null;

// Handler untuk metode POST
export async function POST(request: NextRequest) {
  try {
    // Pastikan body adalah JSON
    if (request.headers.get('content-type') !== 'application/json') {
      return NextResponse.json({ error: 'Expected Content-Type: application/json' }, { status: 400 });
    }

    const body = await request.json();
    console.log('Webhook received:', body); // Log untuk debugging

    // Cek apakah ini event QR dan simpan datanya
    // Sesuaikan jika struktur payload dari mywa berbeda
    if (body && body.qrCode) { // Cek 1: Mencari 'qrCode' (dari tes Postman sebelumnya)
      latestQrCode = body.qrCode;
      console.log('QR Code updated (from qrCode):', latestQrCode);
    } else if (body && body.event === 'qr' && body.data && body.data.qr) { // Cek 2: Mencari 'event' dan 'data.qr' (dari analisis kode whatsapp-api)
        latestQrCode = body.data.qr;
        console.log('QR Code updated (from event/data):', latestQrCode);
    } else if (body && body.dataType === 'qr' && body.data && body.data.qr) { // Cek 3: Mencari 'dataType' dan 'data.qr' (dari log terbaru)
        latestQrCode = body.data.qr;
        console.log('QR Code updated (from dataType/data):', latestQrCode);
    }

    // Kirim respons OK
    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });

  } catch (error) {
    console.error("Error processing POST request:", error);
    // Periksa apakah error karena parsing JSON
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON received' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handler untuk metode GET
export async function GET() {
  try {
    // Endpoint GET untuk mengambil QR terakhir (dipakai oleh frontend)
    return NextResponse.json({ qrCode: latestQrCode }, { status: 200 });
  } catch (error) {
    console.error("Error processing GET request:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handler untuk metode lain tidak diperlukan secara eksplisit di App Router,
// Next.js akan otomatis mengembalikan 405 Method Not Allowed jika metode tidak didefinisikan.