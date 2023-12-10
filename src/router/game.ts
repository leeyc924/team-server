import { Router } from 'express';
import asyncify from 'express-asyncify';
import userTierJson from '../db/userTier.json';
import { sqlToDB } from '@db';
import { parseToNumber } from '@utils';
import dayjs from 'dayjs';

const router = asyncify(Router());

router.get('/list', async (req, res) => {
  res.json();
});

router.get('/detail', async (req, res) => {
  const playDt = req.query['playDt'];
  const sql = `
    SELECT game.play_dt, game.play_part, users.id, users.name, users.age, users.gender, users.address
    FROM game
    JOIN users ON users.id = ANY(game.userids)
    WHERE game.play_dt = '${playDt}';
  `;
  const usersSql = `
    SELECT id, name, age, gender, address
    FROM users;
  `;
  const gameInfo = await sqlToDB(sql);
  const userList = await sqlToDB(usersSql);
  const gameDetail = {
    userList: userList.rows,
    gameList: gameInfo.rows.reduce((acc, cur) => {
      const playDt = cur.play_dt;
      const userFullName = `${cur.name}/${cur.age.slice(2, 4)}/${cur.address}/${cur.gender === 'F' ? '여' : '남'}`;
      const index = acc.findIndex((a: any) => a.play_dt === playDt);
      if (index > -1) {
        acc[index].userList.push({ id: cur.id, userFullName });
        return acc;
      }

      acc.push({
        play_dt: playDt,
        play_part: cur.play_part,
        userList: [{ id: cur.id, userFullName }],
      });
      return acc;
    }, [] as any),
  };

  res.json({ gameDetail });
});

export default router;

// INSERT INTO game (playDt, userIdList, playPart)
// VALUES ('2023-11-29', ARRAY[1, 2, 3], 1);