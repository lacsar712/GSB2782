const db = require('../config/database');
require('dotenv').config();

function parseArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  if (!arg) {
    return fallback;
  }
  return arg.slice(prefix.length);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function toPositiveNumber(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function randomPlateNo() {
  const provinces = ['京', '沪', '粤', '浙', '苏', '川', '鲁', '鄂', '闽', '津'];
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const alnum = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let tail = '';
  for (let i = 0; i < 5; i++) {
    tail += alnum[randomInt(0, alnum.length - 1)];
  }
  return `${provinces[randomInt(0, provinces.length - 1)]}${letters[randomInt(0, letters.length - 1)]}${tail}`;
}

function randomTimeInDay(dayStart) {
  const second = randomInt(0, 24 * 60 * 60 - 1);
  return new Date(dayStart.getTime() + second * 1000);
}

async function seedChartData() {
  const days = Math.floor(toPositiveNumber(parseArg('days', '30'), 30));
  const minPerDay = Math.floor(toPositiveNumber(parseArg('minPerDay', '12'), 12));
  const maxPerDay = Math.floor(toPositiveNumber(parseArg('maxPerDay', '30'), 30));
  const outRate = Math.min(1, toPositiveNumber(parseArg('outRate', '0.82'), 0.82));
  const orderCoverageRate = Math.min(1, toPositiveNumber(parseArg('orderCoverageRate', '0.95'), 0.95));
  const paidRate = Math.min(1, toPositiveNumber(parseArg('paidRate', '0.9'), 0.9));

  const plateColors = ['blue', 'yellow', 'green', 'black', 'white'];
  const vehicleTypes = ['normal', 'normal', 'normal', 'special', 'member'];

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const records = [];
  const insertedRecordMeta = [];

  for (let offset = days - 1; offset >= 0; offset--) {
    const dayStart = new Date(todayStart);
    dayStart.setDate(dayStart.getDate() - offset);

    const countToday = randomInt(minPerDay, Math.max(minPerDay, maxPerDay));
    for (let i = 0; i < countToday; i++) {
      const inTime = randomTimeInDay(dayStart);
      let status = Math.random() < outRate ? 'out' : 'in';
      let outTime = null;

      if (status === 'out') {
        const stayMinutes = randomInt(20, 10 * 60);
        outTime = new Date(inTime.getTime() + stayMinutes * 60 * 1000);
        if (outTime > now) {
          status = 'in';
          outTime = null;
        }
      }

      records.push([
        randomPlateNo(),
        plateColors[randomInt(0, plateColors.length - 1)],
        vehicleTypes[randomInt(0, vehicleTypes.length - 1)],
        inTime,
        outTime,
        status,
      ]);

      insertedRecordMeta.push({
        inTime,
        outTime,
        status,
      });
    }
  }

  if (!records.length) {
    console.log('未生成任何记录，已退出。');
    return;
  }

  const [insertRecordResult] = await db.query(
    `INSERT INTO parking_records (plate_no, plate_color, vehicle_type, in_time, out_time, status)
     VALUES ?`,
    [records]
  );

  const firstRecordId = insertRecordResult.insertId;
  const insertedCount = insertRecordResult.affectedRows;
  const orderRows = [];

  for (let i = 0; i < insertedCount; i++) {
    const meta = insertedRecordMeta[i];
    if (!meta || meta.status !== 'out' || !meta.outTime) {
      continue;
    }
    if (Math.random() > orderCoverageRate) {
      continue;
    }

    const recordId = firstRecordId + i;
    const hours = Math.max(0.5, (meta.outTime.getTime() - meta.inTime.getTime()) / (1000 * 60 * 60));
    const unitPrice = randomFloat(4.8, 9.5);
    const amount = Math.round(Math.max(2, hours * unitPrice) * 100) / 100;
    const isPaid = Math.random() < paidRate;
    const paidAt = isPaid ? new Date(meta.outTime.getTime() + randomInt(1, 30) * 60 * 1000) : null;

    orderRows.push([recordId, amount, isPaid ? 'paid' : 'unpaid', paidAt, meta.outTime]);
  }

  let insertedOrderCount = 0;
  if (orderRows.length) {
    const [insertOrderResult] = await db.query(
      `INSERT INTO orders (record_id, amount, status, paid_at, created_at)
       VALUES ?`,
      [orderRows]
    );
    insertedOrderCount = insertOrderResult.affectedRows;
  }

  console.log('图表测试数据生成完成:');
  console.log(`- 进出场记录: ${insertedCount} 条`);
  console.log(`- 订单数据: ${insertedOrderCount} 条`);
  console.log(`- 覆盖天数: ${days} 天`);
}

seedChartData()
  .catch((error) => {
    console.error('生成图表测试数据失败:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await db.end();
    } catch (error) {
      // 数据库连接初始化失败时，连接池可能已经关闭
    }
  });
