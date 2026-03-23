import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public', 'data.json');

export async function GET() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const password = process.env.ADMIN_PASSWORD;

    if (!password || authHeader !== `Bearer ${password}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    const data = JSON.parse(raw);

    if (action === 'add_record') {
      const { date, seda, usd, price } = body;
      if (!date || seda === undefined || usd === undefined) {
        return NextResponse.json({ error: 'Missing fields: date, seda, usd required' }, { status: 400 });
      }

      const existingIdx = data.records.findIndex((r: any) => r.date === date);
      const record = {
        date,
        seda: Number(seda),
        usd: Number(usd),
        price: price ? Number(price) : null,
      };

      if (existingIdx >= 0) {
        data.records[existingIdx] = record;
      } else {
        data.records.push(record);
        data.records.sort((a: any, b: any) => a.date.localeCompare(b.date));
      }

      data.lastUpdated = date;
    } else if (action === 'update_fast_requests') {
      const { fastRequestsSold } = body;
      data.fastRequestsSold = Number(fastRequestsSold);
    } else if (action === 'delete_record') {
      const { date } = body;
      data.records = data.records.filter((r: any) => r.date !== date);
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true, recordCount: data.records.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
