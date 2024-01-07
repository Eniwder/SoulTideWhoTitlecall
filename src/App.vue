<template>
  <v-app>
    <v-main>
      <v-col v-if="!showResult">
        <v-row justify="center">
          <div class="dummyImgWrapper" @click="randomPlay()">
            <img class="dummyImg">
          </div>
        </v-row>
        <v-row justify="center">
          <img v-for="doll in dolls" :src="basepath + 'dolls/' + doll + '/icon.png'" class="icons"
            @click="selectDoll(doll)">
        </v-row>
        <v-progress-linear :model-value="progress" :height="16" class="progressbar"></v-progress-linear>
      </v-col>
      <v-col v-else class="result">
        <v-row justify="center">
          <p class="text-h4">
            ランク： {{ getRank() }}
          </p>
        </v-row>
        <v-row justify="center">
          <div style="width: 80vw;margin: 16px;">
            <v-divider></v-divider>
          </div>
        </v-row>
        <v-row justify="center">
          <p class="text-h6">回答履歴</p>
        </v-row>
        <v-row justify="center">
          <p>(アイコンをクリックするとCVを確認できるよ！)</p>
        </v-row>
        <v-row justify="center">
          <v-card v-for="history in selectHistory" class="resultcard"
            :color="history.answer === history.select ? 'green' : 'red'">
            <img :src="basepath + 'dolls/' + history.answer + '/icon.png'" @click="selectPlay(history.answer)">
            <span v-if="history.answer !== history.select">
              →
              <img :src="basepath + 'dolls/' + history.select + '/icon.png'" @click="selectPlay(history.select)">
            </span>
          </v-card>
        </v-row>
        <v-row justify="center">
          <div style="width: 80vw;margin: 16px;">
            <v-divider></v-divider>
          </div>
        </v-row>
        <v-row justify="center">
          <v-btn @click="retry">もう一度プレイ</v-btn>
        </v-row>
      </v-col>

    </v-main>

    <v-dialog v-model="isDialogActive" transition="dialog-top-transition" width="auto">
      <v-card>
        <v-toolbar color="primary" title="タイトルコールクイズ！"></v-toolbar>
        <v-card-text>
          <div class="pa-12">誰のタイトルコールか当てるゲームです。<br>
            グレーのアイコンを押すと音声が再生されるので、正解だと思うキャラのアイコンを選択してください。<br>
            全部で28問あるので、28回繰り返してください！<br>
            全て回答すると結果が表示されます。目指せ全問正解！！</div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="isDialogActive = false">始める</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { computed } from 'vue';
import { Buffer } from 'buffer'
window.Buffer = window.Buffer || Buffer
const shuffleArray = arr => arr.map(_ => _).sort(() => Math.random() - Math.random());
const basepath = import.meta.env.BASE_URL;

const dolls = ["Akaset", "Alisa", "AmaneInori", "Andrea", "Asuna", "Aurora", "Benten", "Colcher", "Dolores", "Dreizehn", "Ennis", "EtsukazumMiko", "Freesia", "Gawana", "HagakureRuri", "HazukiYuki", "Juewa", "Lavira", "Minerdwen", "NankungLin", "Netsuki", "NicoletteLamel", "QuLing", "SakuyaMako", "Satya", "Silenus", "TsukinoMiyo", "Virgina"]
// const dolls = ["Akaset", "Alisa", "AmaneInori"] // テスト用
let shuffleDolls = shuffleArray(dolls);

const isDialogActive = ref(true)
const progress = ref(0)
const showResult = ref(false)

function getRank() {
  const correctNum = selectHistory.filter(_ => _.answer === _.select).length;
  const correctRate = correctNum / dolls.length;
  const rank = correctRate >= 1 ? 'SS' :
    correctRate > 0.8 ? 'S' :
      correctRate > 0.5 ? 'A' :
        correctRate > 0.3 ? 'B' : 'C'
  console.log(correctRate, cacheCount)
  return rank + (cacheCount <= 0 ? '+' : '');
}

function retry() {
  shuffleDolls = shuffleArray(dolls);
  progress.value = 0;
  showResult.value = false;
  selectHistory.splice(0, selectHistory.length)
  cacheCount = -shuffleDolls.length; // めんどくさくなった
}

async function randomPlay() {
  if (!shuffleDolls[0]) return;
  const cv = await getCv(shuffleDolls[0]);
  const audio = new Audio('data:audio/wav;base64,' + cv);
  audio.play();
}

async function selectPlay(name) {
  const cv = await getCv(name);
  const audio = new Audio('data:audio/wav;base64,' + cv);
  audio.play();
}

const cvCache = {}
let cacheCount = 0;
async function getCv(name) {
  if (cvCache[name]) {
    cacheCount += 1;
    return cvCache[name];
  }
  const data = (await fetch(`${basepath}dolls/${name}/titlecall.wav.enc`)).body;
  const reader = data.getReader()
  let buf = Buffer.from([])
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf = Buffer.concat([buf, value])
  }
  buf = xor2(buf, Buffer.from("2c", 'hex'));
  var base64 = new Buffer(buf).toString('base64');
  cvCache[name] = base64;
  return cvCache[name];
}

const selectHistory = []
function selectDoll(name) {
  selectHistory.push({
    answer: shuffleDolls[0],
    select: name
  })
  shuffleDolls.shift();
  progress.value = (dolls.length - shuffleDolls.length) * (100 / dolls.length)
  if (shuffleDolls.length <= 0) {
    showResult.value = true;
  }
}

function xor2(hex1, hex2) {
  const buf1 = Buffer.from(hex1, 'hex');
  const buf2 = Buffer.from(hex2, 'hex');
  const bufResult = buf1.map((b, i) => b ^ buf2[i % buf2.length]);
  return bufResult;
}


</script>

<style>
main {
  background: linear-gradient(215deg, #616161 29.9%, #386c8f 80%), linear-gradient(304deg, rgba(63, 91, 78, 0.4) 24.9%, #4d363d 91%), linear-gradient(10deg, #1d2f3b 19.9%, #3d4449 50%), linear-gradient(145deg, #5a9c8e 15.9%, #9c8994 40%);
}

.dummyImgWrapper {
  margin: 16px;
  background-color: lightgray;
  width: 20vh;
  height: 20vh;
  border-radius: 100%;
  cursor: pointer;
  user-select: none;
}

.dummyImg {
  width: 20vh;
  height: 20vh;
  mask-image: url(/dummy.png);
  border-radius: 100%;
  mask-size: 100%;
  cursor: pointer;
  background-color: gray;
  min-width: 64px;
  min-height: 64px;
  position: relative;
}

.dummyImgWrapper::after {
  content: '';
  display: block;
  width: 48%;
  height: 48%;
  background-color: #333;
  clip-path: polygon(0 0, 0 100%, 100% 50%);
  margin-left: 34%;
  margin-top: -80%;
  z-index: 100;
}

.icons {
  user-select: none;
  width: min(14vw, 14vh);
  height: min(14vw, 14vh);
  min-width: 64px;
  min-height: 64px;
  max-width: 160px;
  max-height: 160px;
  margin: 8px;
  border-radius: 100%;
  background-color: black;
  cursor: pointer;
}

.v-progress-linear {
  position: fixed !important;
  top: inherit !important;
  bottom: 0 !important;
}

.result {
  margin-top: 24px;
  margin-bottom: 24px;
}

.resultcard {
  margin: 16px;
}

.resultcard img {
  width: min(10vw, 10vh);
  height: min(10vw, 10vh);
  min-width: 32px;
  min-height: 32px;
  max-width: 160px;
  max-height: 160px;
  margin: 8px;
  cursor: pointer;
  user-select: none;
}
</style>
