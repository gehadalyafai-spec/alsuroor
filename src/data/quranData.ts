import { QuranQuarter } from '../types/quran';

// Canonical list of all 240 Quarters (أرباع القرآن الكريم)
// 30 Juz' * 8 Quarters = 240 Quarters
export const QURAN_QUARTERS: QuranQuarter[] = [
  // الجزء 1 (1 - 8)
  { rubNumber: 1, juz: 1, rubInJuz: 1, hizb: 1, rubInHizb: 1, surahName: "الفاتحة", surahNumber: 1, startVerseText: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", startVerseNumber: 1, approxPage: 1 },
  { rubNumber: 2, juz: 1, rubInJuz: 2, hizb: 1, rubInHizb: 2, surahName: "البقرة", surahNumber: 2, startVerseText: "إِنَّ اللَّهَ لَا يَسْتَحْيِي أَن يَضْرِبَ مَثَلًا", startVerseNumber: 26, approxPage: 5 },
  { rubNumber: 3, juz: 1, rubInJuz: 3, hizb: 1, rubInHizb: 3, surahName: "البقرة", surahNumber: 2, startVerseText: "أَتَأْمُرُونَ النَّاسَ بِالْبِرِّ وَتَنسَوْنَ أَنفُسَكُمْ", startVerseNumber: 44, approxPage: 7 },
  { rubNumber: 4, juz: 1, rubInJuz: 4, hizb: 1, rubInHizb: 4, surahName: "البقرة", surahNumber: 2, startVerseText: "وَإِذِ اسْتَسْقَىٰ مُوسَىٰ لِقَوْمِهِ", startVerseNumber: 60, approxPage: 9 },
  { rubNumber: 5, juz: 1, rubInJuz: 5, hizb: 2, rubInHizb: 1, surahName: "البقرة", surahNumber: 2, startVerseText: "أَفَتَطْمَعُونَ أَن يُؤْمِنُوا لَكُمْ", startVerseNumber: 75, approxPage: 11 },
  { rubNumber: 6, juz: 1, rubInJuz: 6, hizb: 2, rubInHizb: 2, surahName: "البقرة", surahNumber: 2, startVerseText: "وَلَقَدْ جَاءَكُم مُّوسَىٰ بِالْبَيِّنَاتِ", startVerseNumber: 92, approxPage: 14 },
  { rubNumber: 7, juz: 1, rubInJuz: 7, hizb: 2, rubInHizb: 3, surahName: "البقرة", surahNumber: 2, startVerseText: "مَا نَنسَخْ مِنْ آيَةٍ أَوْ نُنسِهَا", startVerseNumber: 106, approxPage: 17 },
  { rubNumber: 8, juz: 1, rubInJuz: 8, hizb: 2, rubInHizb: 4, surahName: "البقرة", surahNumber: 2, startVerseText: "وَإِذِ ابْتَلَىٰ إِبْرَاهِيمَ رَبُّهُ بِكَلِمَاتٍ", startVerseNumber: 124, approxPage: 19 },

  // الجزء 2 (9 - 16)
  { rubNumber: 9, juz: 2, rubInJuz: 1, hizb: 3, rubInHizb: 1, surahName: "البقرة", surahNumber: 2, startVerseText: "سَيَقُولُ السُّفَهَاءُ مِنَ النَّاسِ", startVerseNumber: 142, approxPage: 22 },
  { rubNumber: 10, juz: 2, rubInJuz: 2, hizb: 3, rubInHizb: 2, surahName: "البقرة", surahNumber: 2, startVerseText: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ", startVerseNumber: 158, approxPage: 24 },
  { rubNumber: 11, juz: 2, rubInJuz: 3, hizb: 3, rubInHizb: 3, surahName: "البقرة", surahNumber: 2, startVerseText: "لَّيْسَ الْبِرَّ أَن تُوَلُّوا وُجُوهَكُمْ", startVerseNumber: 177, approxPage: 27 },
  { rubNumber: 12, juz: 2, rubInJuz: 4, hizb: 3, rubInHizb: 4, surahName: "البقرة", surahNumber: 2, startVerseText: "يَسْأَلُونَكَ عَنِ الْأَهِلَّةِ", startVerseNumber: 189, approxPage: 29 },
  { rubNumber: 13, juz: 2, rubInJuz: 5, hizb: 4, rubInHizb: 1, surahName: "البقرة", surahNumber: 2, startVerseText: "وَاذْكُرُوا اللَّهَ فِي أَيَّامٍ مَّعْدُودَاتٍ", startVerseNumber: 203, approxPage: 32 },
  { rubNumber: 14, juz: 2, rubInJuz: 6, hizb: 4, rubInHizb: 2, surahName: "البقرة", surahNumber: 2, startVerseText: "يَسْأَلُونَكَ عَنِ الْخَمْرِ وَالْمَيْسِرِ", startVerseNumber: 219, approxPage: 34 },
  { rubNumber: 15, juz: 2, rubInJuz: 7, hizb: 4, rubInHizb: 3, surahName: "البقرة", surahNumber: 2, startVerseText: "وَالْوَالِدَاتُ يُرْضِعْنَ أَوْلَادَهُنَّ", startVerseNumber: 233, approxPage: 37 },
  { rubNumber: 16, juz: 2, rubInJuz: 8, hizb: 4, rubInHizb: 4, surahName: "البقرة", surahNumber: 2, startVerseText: "أَلَمْ تَرَ إِلَى الَّذِينَ خَرَجُوا مِن دِيَارِهِمْ", startVerseNumber: 243, approxPage: 39 },

  // الجزء 3 (17 - 24)
  { rubNumber: 17, juz: 3, rubInJuz: 1, hizb: 5, rubInHizb: 1, surahName: "البقرة", surahNumber: 2, startVerseText: "تِلْكَ الرُّسُلُ فَضَّلْنَا بَعْضَهُمْ عَلَىٰ بَعْضٍ", startVerseNumber: 253, approxPage: 42 },
  { rubNumber: 18, juz: 3, rubInJuz: 2, hizb: 5, rubInHizb: 2, surahName: "البقرة", surahNumber: 2, startVerseText: "مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ", startVerseNumber: 261, approxPage: 44 },
  { rubNumber: 19, juz: 3, rubInJuz: 3, hizb: 5, rubInHizb: 3, surahName: "البقرة", surahNumber: 2, startVerseText: "يَا أَيُّهَا الَّذِينَ آمَنُوا أَنفِقُوا مِن طَيِّبَاتِ", startVerseNumber: 272, approxPage: 46 },
  { rubNumber: 20, juz: 3, rubInJuz: 4, hizb: 5, rubInHizb: 4, surahName: "آل عمران", surahNumber: 3, startVerseText: "الم ۝ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", startVerseNumber: 1, approxPage: 50 },
  { rubNumber: 21, juz: 3, rubInJuz: 5, hizb: 6, rubInHizb: 1, surahName: "آل عمران", surahNumber: 3, startVerseText: "إِنَّ اللَّهَ اصْطَفَىٰ آدَمَ وَنُوحًا", startVerseNumber: 33, approxPage: 54 },
  { rubNumber: 22, juz: 3, rubInJuz: 6, hizb: 6, rubInHizb: 2, surahName: "آل عمران", surahNumber: 3, startVerseText: "فَلَمَّا أَحَسَّ عِيسَىٰ مِنْهُمُ الْكُفْرَ", startVerseNumber: 52, approxPage: 56 },
  { rubNumber: 23, juz: 3, rubInJuz: 7, hizb: 6, rubInHizb: 3, surahName: "آل عمران", surahNumber: 3, startVerseText: "إِنَّ أَوْلَى النَّاسِ بِإِبْرَاهِيمَ لَلَّذِينَ اتَّبَعُوهُ", startVerseNumber: 68, approxPage: 58 },
  { rubNumber: 24, juz: 3, rubInJuz: 8, hizb: 6, rubInHizb: 4, surahName: "آل عمران", surahNumber: 3, startVerseText: "قُلْ آمَنَّا بِاللَّهِ وَمَا أُنزِلَ عَلَيْنَا", startVerseNumber: 84, approxPage: 60 },

  // الجزء 4 (25 - 32)
  { rubNumber: 25, juz: 4, rubInJuz: 1, hizb: 7, rubInHizb: 1, surahName: "آل عمران", surahNumber: 3, startVerseText: "لَن تَنَالُوا الْبِرَّ حَتَّىٰ تُنفِقُوا مِمَّا تُحِبُّونَ", startVerseNumber: 92, approxPage: 62 },
  { rubNumber: 26, juz: 4, rubInJuz: 2, hizb: 7, rubInHizb: 2, surahName: "آل عمران", surahNumber: 3, startVerseText: "كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ", startVerseNumber: 110, approxPage: 64 },
  { rubNumber: 27, juz: 4, rubInJuz: 3, hizb: 7, rubInHizb: 3, surahName: "آل عمران", surahNumber: 3, startVerseText: "إِذْ تَصْعَدُونَ وَلَا تَلْوُونَ عَلَىٰ أَحَدٍ", startVerseNumber: 153, approxPage: 70 },
  { rubNumber: 28, juz: 4, rubInJuz: 4, hizb: 7, rubInHizb: 4, surahName: "آل عمران", surahNumber: 3, startVerseText: "الَّذِينَ اسْتَجَابُوا لِلَّهِ وَالرَّسُولِ", startVerseNumber: 172, approxPage: 72 },
  { rubNumber: 29, juz: 4, rubInJuz: 5, hizb: 8, rubInHizb: 1, surahName: "النساء", surahNumber: 4, startVerseText: "يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُم", startVerseNumber: 1, approxPage: 77 },
  { rubNumber: 30, juz: 4, rubInJuz: 6, hizb: 8, rubInHizb: 2, surahName: "النساء", surahNumber: 4, startVerseText: "وَلْيَخْشَ الَّذِينَ لَوْ تَرَكُوا مِنْ خَلْفِهِمْ", startVerseNumber: 9, approxPage: 78 },
  { rubNumber: 31, juz: 4, rubInJuz: 7, hizb: 8, rubInHizb: 3, surahName: "النساء", surahNumber: 4, startVerseText: "وَإِنْ أَرَدتُّمُ اسْتِبْدَالَ زَوْجٍ مَّكَانَ زَوْجٍ", startVerseNumber: 20, approxPage: 80 },
  { rubNumber: 32, juz: 4, rubInJuz: 8, hizb: 8, rubInHizb: 4, surahName: "النساء", surahNumber: 4, startVerseText: "وَالْمُحْصَنَاتُ مِنَ النِّسَاءِ إِلَّا مَا مَلَكَتْ أَيْمَانُكُمْ", startVerseNumber: 24, approxPage: 81 },

  // الجزء 5 (33 - 40)
  { rubNumber: 33, juz: 5, rubInJuz: 1, hizb: 9, rubInHizb: 1, surahName: "النساء", surahNumber: 4, startVerseText: "وَحُرِّمَتْ عَلَيْكُمْ أُمَّهَاتُكُمْ ... وَالْمُحْصَنَاتُ", startVerseNumber: 24, approxPage: 82 },
  { rubNumber: 34, juz: 5, rubInJuz: 2, hizb: 9, rubInHizb: 2, surahName: "النساء", surahNumber: 4, startVerseText: "وَاعْبُدُوا اللَّهَ وَلَا تُشْرِكُوا بِهِ شَيْئًا", startVerseNumber: 36, approxPage: 84 },
  { rubNumber: 35, juz: 5, rubInJuz: 3, hizb: 9, rubInHizb: 3, surahName: "النساء", surahNumber: 4, startVerseText: "أَلَمْ تَرَ إِلَى الَّذِينَ أُوتُوا نَصِيبًا مِّنَ الْكِتَابِ", startVerseNumber: 44, approxPage: 85 },
  { rubNumber: 36, juz: 5, rubInJuz: 4, hizb: 9, rubInHizb: 4, surahName: "النساء", surahNumber: 4, startVerseText: "إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ", startVerseNumber: 58, approxPage: 87 },
  { rubNumber: 37, juz: 5, rubInJuz: 5, hizb: 10, rubInHizb: 1, surahName: "النساء", surahNumber: 4, startVerseText: "فَلْيُقَاتِلْ فِي سَبِيلِ اللَّهِ الَّذِينَ يَشْرُونَ", startVerseNumber: 74, approxPage: 90 },
  { rubNumber: 38, juz: 5, rubInJuz: 6, hizb: 10, rubInHizb: 2, surahName: "النساء", surahNumber: 4, startVerseText: "فَمَا لَكُمْ فِي الْمُنَافِقِينَ فِئَتَيْنِ", startVerseNumber: 88, approxPage: 92 },
  { rubNumber: 39, juz: 5, rubInJuz: 7, hizb: 10, rubInHizb: 3, surahName: "النساء", surahNumber: 4, startVerseText: "وَمَن يَقْتُلْ مُؤْمِنًا مُّتَعَمِّدًا", startVerseNumber: 93, approxPage: 93 },
  { rubNumber: 40, juz: 5, rubInJuz: 8, hizb: 10, rubInHizb: 4, surahName: "النساء", surahNumber: 4, startVerseText: "وَإِذَا ضَرَبْتُمْ فِي الْأَرْضِ فَلَيْسَ عَلَيْكُمْ", startVerseNumber: 101, approxPage: 94 },

  // الجزء 6 (41 - 48)
  { rubNumber: 41, juz: 6, rubInJuz: 1, hizb: 11, rubInHizb: 1, surahName: "النساء", surahNumber: 4, startVerseText: "لَّا يُحِبُّ اللَّهُ الْجَهْرَ بِالسُّوءِ مِنَ الْقَوْلِ", startVerseNumber: 148, approxPage: 102 },
  { rubNumber: 42, juz: 6, rubInJuz: 2, hizb: 11, rubInHizb: 2, surahName: "النساء", surahNumber: 4, startVerseText: "يَسْأَلُكَ أَهْلُ الْكِتَابِ أَن تُنَزِّلَ عَلَيْهِمْ", startVerseNumber: 153, approxPage: 103 },
  { rubNumber: 43, juz: 6, rubInJuz: 3, hizb: 11, rubInHizb: 3, surahName: "النساء", surahNumber: 4, startVerseText: "إِنَّا أَوْحَيْنَا إِلَيْكَ كَمَا أَوْحَيْنَا إِلَىٰ نُوحٍ", startVerseNumber: 163, approxPage: 104 },
  { rubNumber: 44, juz: 6, rubInJuz: 4, hizb: 11, rubInHizb: 4, surahName: "المائدة", surahNumber: 5, startVerseText: "يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ", startVerseNumber: 1, approxPage: 106 },
  { rubNumber: 45, juz: 6, rubInJuz: 5, hizb: 12, rubInHizb: 1, surahName: "المائدة", surahNumber: 5, startVerseText: "وَاذْكُرُوا نِعْمَةَ اللَّهِ عَلَيْكُمْ وَمِيثَاقَهُ", startVerseNumber: 7, approxPage: 108 },
  { rubNumber: 46, juz: 6, rubInJuz: 6, hizb: 12, rubInHizb: 2, surahName: "المائدة", surahNumber: 5, startVerseText: "وَاتْلُ عَلَيْهِمْ نَبَأَ ابْنَيْ آدَمَ بِالْحَقِّ", startVerseNumber: 27, approxPage: 112 },
  { rubNumber: 47, juz: 6, rubInJuz: 7, hizb: 12, rubInHizb: 3, surahName: "المائدة", surahNumber: 5, startVerseText: "يَا أَيُّهَا الرَّسُولُ بَلِّغْ مَا أُنزِلَ إِلَيْكَ", startVerseNumber: 67, approxPage: 119 },
  { rubNumber: 48, juz: 6, rubInJuz: 8, hizb: 12, rubInHizb: 4, surahName: "المائدة", surahNumber: 5, startVerseText: "لَتَجِدَنَّ أَشَدَّ النَّاسِ عَدَاوَةً لِّلَّذِينَ آمَنُوا", startVerseNumber: 82, approxPage: 121 },

  // الجزء 7 (49 - 56)
  { rubNumber: 49, juz: 7, rubInJuz: 1, hizb: 13, rubInHizb: 1, surahName: "المائدة", surahNumber: 5, startVerseText: "وَإِذَا سَمِعُوا مَا أُنزِلَ إِلَى الرَّسُولِ", startVerseNumber: 83, approxPage: 122 },
  { rubNumber: 50, juz: 7, rubInJuz: 2, hizb: 13, rubInHizb: 2, surahName: "المائدة", surahNumber: 5, startVerseText: "قَالَ عِيسَى ابْنُ مَرْيَمَ اللَّهُمَّ رَبَّنَا أَنزِلْ عَلَيْنَا مَائِدَةً", startVerseNumber: 114, approxPage: 127 },
  { rubNumber: 51, juz: 7, rubInJuz: 3, hizb: 13, rubInHizb: 3, surahName: "الأنعام", surahNumber: 6, startVerseText: "الْحَمْدُ لِلَّهِ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ", startVerseNumber: 1, approxPage: 128 },
  { rubNumber: 52, juz: 7, rubInJuz: 4, hizb: 13, rubInHizb: 4, surahName: "الأنعام", surahNumber: 6, startVerseText: "وَلَهُ مَا سَكَنَ فِي اللَّيْلِ وَالنَّهَارِ", startVerseNumber: 13, approxPage: 130 },
  { rubNumber: 53, juz: 7, rubInJuz: 5, hizb: 14, rubInHizb: 1, surahName: "الأنعام", surahNumber: 6, startVerseText: "قُلْ أَرَأَيْتَكُمْ إِنْ أَتَاكُمْ عَذَابُ اللَّهِ", startVerseNumber: 40, approxPage: 132 },
  { rubNumber: 54, juz: 7, rubInJuz: 6, hizb: 14, rubInHizb: 2, surahName: "الأنعام", surahNumber: 6, startVerseText: "وَإِذْ قَالَ إِبْرَاهِيمُ لِأَبِيهِ آزَرَ أَتَتَّخِذُ أَصْنَامًا", startVerseNumber: 74, approxPage: 136 },
  { rubNumber: 55, juz: 7, rubInJuz: 7, hizb: 14, rubInHizb: 3, surahName: "الأنعام", surahNumber: 6, startVerseText: "إِنَّ اللَّهَ فَالِقُ الْحَبِّ وَالنَّوَىٰ", startVerseNumber: 95, approxPage: 140 },
  { rubNumber: 56, juz: 7, rubInJuz: 8, hizb: 14, rubInHizb: 4, surahName: "الأنعام", surahNumber: 6, startVerseText: "وَإِذَا جَاءَتْهُمْ آيَةٌ قَالُوا لَن نُّؤْمِنَ", startVerseNumber: 124, approxPage: 144 },

  // الجزء 8 (57 - 64)
  { rubNumber: 57, juz: 8, rubInJuz: 1, hizb: 15, rubInHizb: 1, surahName: "الأنعام", surahNumber: 6, startVerseText: "وَلَوْ أَنَّنَا نَزَّلْنَا إِلَيْهِمُ الْمَلَائِكَةَ", startVerseNumber: 111, approxPage: 142 },
  { rubNumber: 58, juz: 8, rubInJuz: 2, hizb: 15, rubInHizb: 2, surahName: "الأنعام", surahNumber: 6, startVerseText: "وَهُوَ الَّذِي أَنشَأَ جَنَّاتٍ مَّعْرُوشَاتٍ", startVerseNumber: 141, approxPage: 146 },
  { rubNumber: 59, juz: 8, rubInJuz: 3, hizb: 15, rubInHizb: 3, surahName: "الأعراف", surahNumber: 7, startVerseText: "المص ۝ كِتَابٌ أُنزِلَ إِلَيْكَ", startVerseNumber: 1, approxPage: 151 },
  { rubNumber: 60, juz: 8, rubInJuz: 4, hizb: 15, rubInHizb: 4, surahName: "الأعراف", surahNumber: 7, startVerseText: "وَإِذَا فَعَلُوا فَاحِشَةً قَالُوا وَجَدْنَا عَلَيْهَا آبَاءَنَا", startVerseNumber: 28, approxPage: 153 },
  { rubNumber: 61, juz: 8, rubInJuz: 5, hizb: 16, rubInHizb: 1, surahName: "الأعراف", surahNumber: 7, startVerseText: "إِنَّ رَبَّكُمُ اللَّهُ الَّذِي خَلَقَ السَّمَاوَاتِ", startVerseNumber: 54, approxPage: 157 },
  { rubNumber: 62, juz: 8, rubInJuz: 6, hizb: 16, rubInHizb: 2, surahName: "الأعراف", surahNumber: 7, startVerseText: "وَإِلَىٰ عَادٍ أَخَاهُمْ هُودًا", startVerseNumber: 65, approxPage: 158 },
  { rubNumber: 63, juz: 8, rubInJuz: 7, hizb: 16, rubInHizb: 3, surahName: "الأعراف", surahNumber: 7, startVerseText: "وَإِلَىٰ مَدْيَنَ أَخَاهُمْ شُعَيْبًا", startVerseNumber: 85, approxPage: 161 },
  { rubNumber: 64, juz: 8, rubInJuz: 8, hizb: 16, rubInHizb: 4, surahName: "الأعراف", surahNumber: 7, startVerseText: "قَالَ الْمَلَأُ الَّذِينَ اسْتَكْبَرُوا مِن قَوْمِهِ لَنُخْرِجَنَّكَ", startVerseNumber: 88, approxPage: 162 },

  // الجزء 9 (65 - 72)
  { rubNumber: 65, juz: 9, rubInJuz: 1, hizb: 17, rubInHizb: 1, surahName: "الأعراف", surahNumber: 7, startVerseText: "قَالَ الْمَلَأُ الَّذِينَ اسْتَكْبَرُوا", startVerseNumber: 88, approxPage: 162 },
  { rubNumber: 66, juz: 9, rubInJuz: 2, hizb: 17, rubInHizb: 2, surahName: "الأعراف", surahNumber: 7, startVerseText: "وَقَطَّعْنَاهُمْ فِي الْأَرْضِ أُمَمًا", startVerseNumber: 168, approxPage: 172 },
  { rubNumber: 67, juz: 9, rubInJuz: 3, hizb: 17, rubInHizb: 3, surahName: "الأعراف", surahNumber: 7, startVerseText: "وَاتْلُ عَلَيْهِمْ نَبَأَ الَّذِي آتَيْنَاهُ آيَاتِنَا", startVerseNumber: 175, approxPage: 173 },
  { rubNumber: 68, juz: 9, rubInJuz: 4, hizb: 17, rubInHizb: 4, surahName: "الأنفال", surahNumber: 8, startVerseText: "يَسْأَلُونَكَ عَنِ الْأَنفَالِ", startVerseNumber: 1, approxPage: 177 },
  { rubNumber: 69, juz: 9, rubInJuz: 5, hizb: 18, rubInHizb: 1, surahName: "الأنفال", surahNumber: 8, startVerseText: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَجِيبُوا لِلَّهِ", startVerseNumber: 24, approxPage: 180 },
  { rubNumber: 70, juz: 9, rubInJuz: 6, hizb: 18, rubInHizb: 2, surahName: "الأنفال", surahNumber: 8, startVerseText: "إِذْ أَنتُم بِالْعُدْوَةِ الدُّنْيَا", startVerseNumber: 42, approxPage: 182 },
  { rubNumber: 71, juz: 9, rubInJuz: 7, hizb: 18, rubInHizb: 3, surahName: "الأنفال", surahNumber: 8, startVerseText: "وَإِن جَنَحُوا لِلسَّلْمِ فَاجْنَحْ لَهَا", startVerseNumber: 61, approxPage: 184 },
  { rubNumber: 72, juz: 9, rubInJuz: 8, hizb: 18, rubInHizb: 4, surahName: "التوبة", surahNumber: 9, startVerseText: "بَرَاءَةٌ مِّنَ اللَّهِ وَرَسُولِهِ", startVerseNumber: 1, approxPage: 187 },

  // الجزء 10 (73 - 80)
  { rubNumber: 73, juz: 10, rubInJuz: 1, hizb: 19, rubInHizb: 1, surahName: "الأنفال", surahNumber: 8, startVerseText: "وَاعْلَمُوا أَنَّمَا غَنِمْتُم مِّن شَيْءٍ", startVerseNumber: 41, approxPage: 182 },
  { rubNumber: 74, juz: 10, rubInJuz: 2, hizb: 19, rubInHizb: 2, surahName: "التوبة", surahNumber: 9, startVerseText: "إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا", startVerseNumber: 36, approxPage: 193 },
  { rubNumber: 75, juz: 10, rubInJuz: 3, hizb: 19, rubInHizb: 3, surahName: "التوبة", surahNumber: 9, startVerseText: "يَحْلِفُونَ بِاللَّهِ لَكُمْ لِيُرْضُوكُمْ", startVerseNumber: 62, approxPage: 197 },
  { rubNumber: 76, juz: 10, rubInJuz: 4, hizb: 19, rubInHizb: 4, surahName: "التوبة", surahNumber: 9, startVerseText: "إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ", startVerseNumber: 60, approxPage: 196 },
  { rubNumber: 77, juz: 10, rubInJuz: 5, hizb: 20, rubInHizb: 1, surahName: "التوبة", surahNumber: 9, startVerseText: "يَحْذَرُ الْمُنَافِقُونَ أَن تُنَزَّلَ عَلَيْهِمْ سُورَةٌ", startVerseNumber: 64, approxPage: 197 },
  { rubNumber: 78, juz: 10, rubInJuz: 6, hizb: 20, rubInHizb: 2, surahName: "التوبة", surahNumber: 9, startVerseText: "وَالَّذِينَ اتَّخَذُوا مَسْجِدًا ضِرَارًا", startVerseNumber: 107, approxPage: 204 },
  { rubNumber: 79, juz: 10, rubInJuz: 7, hizb: 20, rubInHizb: 3, surahName: "التوبة", surahNumber: 9, startVerseText: "إِنَّ اللَّهَ اشْتَرَىٰ مِنَ الْمُؤْمِنِينَ أَنفُسَهُمْ", startVerseNumber: 111, approxPage: 205 },
  { rubNumber: 80, juz: 10, rubInJuz: 8, hizb: 20, rubInHizb: 4, surahName: "يونس", surahNumber: 10, startVerseText: "الر ۚ تِلْكَ آيَاتُ الْكِتَابِ الْحَكِيمِ", startVerseNumber: 1, approxPage: 208 },

  // الجزء 11 (81 - 88)
  { rubNumber: 81, juz: 11, rubInJuz: 1, hizb: 21, rubInHizb: 1, surahName: "التوبة", surahNumber: 9, startVerseText: "يَعْتَذِرُونَ إِلَيْكُمْ إِذَا رَجَعْتُمْ إِلَيْهِمْ", startVerseNumber: 94, approxPage: 202 },
  { rubNumber: 82, juz: 11, rubInJuz: 2, hizb: 21, rubInHizb: 2, surahName: "يونس", surahNumber: 10, startVerseText: "إِنَّمَا مَثَلُ الْحَيَاةِ الدُّنْيَا كَمَاءٍ أَنزَلْنَاهُ", startVerseNumber: 24, approxPage: 211 },
  { rubNumber: 83, juz: 11, rubInJuz: 3, hizb: 21, rubInHizb: 3, surahName: "يونس", surahNumber: 10, startVerseText: "فَمَن يُرِدِ اللَّهُ أَن يَهْدِيَهُ يَشْرَحْ صَدْرَهُ", startVerseNumber: 53, approxPage: 215 },
  { rubNumber: 84, juz: 11, rubInJuz: 4, hizb: 21, rubInHizb: 4, surahName: "يونس", surahNumber: 10, startVerseText: "وَاتْلُ عَلَيْهِمْ نَبَأَ نُوحٍ", startVerseNumber: 71, approxPage: 217 },
  { rubNumber: 85, juz: 11, rubInJuz: 5, hizb: 22, rubInHizb: 1, surahName: "هود", surahNumber: 11, startVerseText: "الر ۚ كِتَابٌ أُحْكِمَتْ آيَاتُهُ", startVerseNumber: 1, approxPage: 221 },
  { rubNumber: 86, juz: 11, rubInJuz: 6, hizb: 22, rubInHizb: 2, surahName: "هود", surahNumber: 11, startVerseText: "أَفَمَن كَانَ عَلَىٰ بَيِّنَةٍ مِّن رَّبِّهِ", startVerseNumber: 17, approxPage: 223 },
  { rubNumber: 87, juz: 11, rubInJuz: 7, hizb: 22, rubInHizb: 3, surahName: "هود", surahNumber: 11, startVerseText: "وَيَا قَوْمِ لَا أَسْأَلُكُمْ عَلَيْهِ مَالًا", startVerseNumber: 29, approxPage: 225 },
  { rubNumber: 88, juz: 11, rubInJuz: 8, hizb: 22, rubInHizb: 4, surahName: "هود", surahNumber: 11, startVerseText: "قِيلَ يَا نُوحُ اهْبِطْ بِسَلَامٍ مِّنَّا", startVerseNumber: 48, approxPage: 227 },

  // الجزء 12 (89 - 96)
  { rubNumber: 89, juz: 12, rubInJuz: 1, hizb: 23, rubInHizb: 1, surahName: "هود", surahNumber: 11, startVerseText: "وَمَا مِن دَابَّةٍ فِي الْأَرْضِ إِلَّا عَلَى اللَّهِ رِزْقُهَا", startVerseNumber: 6, approxPage: 222 },
  { rubNumber: 90, juz: 12, rubInJuz: 2, hizb: 23, rubInHizb: 2, surahName: "هود", surahNumber: 11, startVerseText: "وَإِلَىٰ ثَمُودَ أَخَاهُمْ صَالِحًا", startVerseNumber: 61, approxPage: 228 },
  { rubNumber: 91, juz: 12, rubInJuz: 3, hizb: 23, rubInHizb: 3, surahName: "هود", surahNumber: 11, startVerseText: "وَإِلَىٰ مَدْيَنَ أَخَاهُمْ شُعَيْبًا", startVerseNumber: 84, approxPage: 231 },
  { rubNumber: 92, juz: 12, rubInJuz: 4, hizb: 23, rubInHizb: 4, surahName: "يوسف", surahNumber: 12, startVerseText: "الر ۚ تِلْكَ آيَاتُ الْكِتَابِ الْمُبِينِ", startVerseNumber: 1, approxPage: 235 },
  { rubNumber: 93, juz: 12, rubInJuz: 5, hizb: 24, rubInHizb: 1, surahName: "يوسف", surahNumber: 12, startVerseText: "وَقَالَ الَّذِي اشْتَرَاهُ مِن مِّصْرَ لِامْرَأَتِهِ", startVerseNumber: 21, approxPage: 237 },
  { rubNumber: 94, juz: 12, rubInJuz: 6, hizb: 24, rubInHizb: 2, surahName: "يوسف", surahNumber: 12, startVerseText: "وَقَالَ الْمَلِكُ إِنِّي أَرَىٰ سَبْعَ بَقَرَاتٍ", startVerseNumber: 43, approxPage: 240 },
  { rubNumber: 95, juz: 12, rubInJuz: 7, hizb: 24, rubInHizb: 3, surahName: "يوسف", surahNumber: 12, startVerseText: "وَقَالَ الْمَلِكُ ائْتُونِي بِهِ أَسْتَخْلِصْهُ لِنَفْسِي", startVerseNumber: 54, approxPage: 241 },
  { rubNumber: 96, juz: 12, rubInJuz: 8, hizb: 24, rubInHizb: 4, surahName: "يوسف", surahNumber: 12, startVerseText: "وَلَمَّا دَخَلُوا مِنْ حَيْثُ أَمَرَهُمْ أَبُوهُم", startVerseNumber: 68, approxPage: 243 },

  // الجزء 13 (97 - 104)
  { rubNumber: 97, juz: 13, rubInJuz: 1, hizb: 25, rubInHizb: 1, surahName: "يوسف", surahNumber: 12, startVerseText: "وَمَا أُبَرِّئُ نَفْسِي ۚ إِنَّ النَّفْسَ لَأَمَّارَةٌ بِالسُّوءِ", startVerseNumber: 53, approxPage: 241 },
  { rubNumber: 98, juz: 13, rubInJuz: 2, hizb: 25, rubInHizb: 2, surahName: "يوسف", surahNumber: 12, startVerseText: "قَالُوا أَإِنَّكَ لَأَنتَ يُوسُفُ", startVerseNumber: 90, approxPage: 246 },
  { rubNumber: 99, juz: 13, rubInJuz: 3, hizb: 25, rubInHizb: 3, surahName: "الرعد", surahNumber: 13, startVerseText: "المر ۚ تِلْكَ آيَاتُ الْكِتَابِ", startVerseNumber: 1, approxPage: 249 },
  { rubNumber: 100, juz: 13, rubInJuz: 4, hizb: 25, rubInHizb: 4, surahName: "الرعد", surahNumber: 13, startVerseText: "اللَّهُ يَعْلَمُ مَا تَحْمِلُ كُلُّ أُنثَىٰ", startVerseNumber: 8, approxPage: 250 },
  { rubNumber: 101, juz: 13, rubInJuz: 5, hizb: 26, rubInHizb: 1, surahName: "الرعد", surahNumber: 13, startVerseText: "أَفَمَن يَعْلَمُ أَنَّمَا أُنزِلَ إِلَيْكَ مِن رَّبِّكَ الْحَقُّ", startVerseNumber: 19, approxPage: 252 },
  { rubNumber: 102, juz: 13, rubInJuz: 6, hizb: 26, rubInHizb: 2, surahName: "إبراهيم", surahNumber: 14, startVerseText: "الر ۚ كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ لِتُخْرِجَ النَّاسَ", startVerseNumber: 1, approxPage: 255 },
  { rubNumber: 103, juz: 13, rubInJuz: 7, hizb: 26, rubInHizb: 3, surahName: "إبراهيم", surahNumber: 14, startVerseText: "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ", startVerseNumber: 7, approxPage: 256 },
  { rubNumber: 104, juz: 13, rubInJuz: 8, hizb: 26, rubInHizb: 4, surahName: "إبراهيم", surahNumber: 14, startVerseText: "أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً", startVerseNumber: 24, approxPage: 258 },

  // الجزء 14 (105 - 112)
  { rubNumber: 105, juz: 14, rubInJuz: 1, hizb: 27, rubInHizb: 1, surahName: "الحجر", surahNumber: 15, startVerseText: "الر ۚ تِلْكَ آيَاتُ الْكِتَابِ وَقُرْآنٍ مُّبِينٍ", startVerseNumber: 1, approxPage: 262 },
  { rubNumber: 106, juz: 14, rubInJuz: 2, hizb: 27, rubInHizb: 2, surahName: "الحجر", surahNumber: 15, startVerseText: "وَلَقَدْ جَعَلْنَا فِي السَّمَاءِ بُرُوجًا", startVerseNumber: 16, approxPage: 263 },
  { rubNumber: 107, juz: 14, rubInJuz: 3, hizb: 27, rubInHizb: 3, surahName: "الحجر", surahNumber: 15, startVerseText: "نَبِّئْ عِبَادِي أَنِّي أَنَا الْغَفُورُ الرَّحِيمُ", startVerseNumber: 49, approxPage: 265 },
  { rubNumber: 108, juz: 14, rubInJuz: 4, hizb: 27, rubInHizb: 4, surahName: "النحل", surahNumber: 16, startVerseText: "أَتَىٰ أَمْرُ اللَّهِ فَلَا تَسْتَعْجِلُوهُ", startVerseNumber: 1, approxPage: 267 },
  { rubNumber: 109, juz: 14, rubInJuz: 5, hizb: 28, rubInHizb: 1, surahName: "النحل", surahNumber: 16, startVerseText: "وَقِيلَ لِلَّذِينَ اتَّقَوْا مَاذَا أَنزَلَ رَبُّكُمْ", startVerseNumber: 30, approxPage: 270 },
  { rubNumber: 110, juz: 14, rubInJuz: 6, hizb: 28, rubInHizb: 2, surahName: "النحل", surahNumber: 16, startVerseText: "أَوَلَمْ يَرَوْا إِلَىٰ مَا خَلَقَ اللَّهُ مِن شَيْءٍ", startVerseNumber: 48, approxPage: 272 },
  { rubNumber: 111, juz: 14, rubInJuz: 7, hizb: 28, rubInHizb: 3, surahName: "النحل", surahNumber: 16, startVerseText: "وَضَرَبَ اللَّهُ مَثَلًا رَّجُلَيْنِ أَحَدُهُمَا أَبْكَمُ", startVerseNumber: 76, approxPage: 275 },
  { rubNumber: 112, juz: 14, rubInJuz: 8, hizb: 28, rubInHizb: 4, surahName: "النحل", surahNumber: 16, startVerseText: "مَنْ عَمِلَ صَالِحًا مِّن ذَكَرٍ أَوْ أُنثَىٰ وَهُوَ مُؤْمِنٌ", startVerseNumber: 97, approxPage: 278 },

  // الجزء 15 (113 - 120)
  { rubNumber: 113, juz: 15, rubInJuz: 1, hizb: 29, rubInHizb: 1, surahName: "الإسراء", surahNumber: 17, startVerseText: "سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا", startVerseNumber: 1, approxPage: 282 },
  { rubNumber: 114, juz: 15, rubInJuz: 2, hizb: 29, rubInHizb: 2, surahName: "الإسراء", surahNumber: 17, startVerseText: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ", startVerseNumber: 23, approxPage: 284 },
  { rubNumber: 115, juz: 15, rubInJuz: 3, hizb: 29, rubInHizb: 3, surahName: "الإسراء", surahNumber: 17, startVerseText: "قُل لَّئِنِ اجْتَمَعَتِ الْإِنسُ وَالْجِنُّ عَلَىٰ أَن يَأْتُوا بِمِثْلِ هَٰذَا الْقُرْآنِ", startVerseNumber: 88, approxPage: 291 },
  { rubNumber: 116, juz: 15, rubInJuz: 4, hizb: 29, rubInHizb: 4, surahName: "الإسراء", surahNumber: 17, startVerseText: "قَالَ أَرَأَيْتَكَ هَٰذَا الَّذِي كَرَّمْتَ عَلَيَّ", startVerseNumber: 62, approxPage: 288 },
  { rubNumber: 117, juz: 15, rubInJuz: 5, hizb: 30, rubInHizb: 1, surahName: "الكهف", surahNumber: 18, startVerseText: "الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ", startVerseNumber: 1, approxPage: 293 },
  { rubNumber: 118, juz: 15, rubInJuz: 6, hizb: 30, rubInHizb: 2, surahName: "الكهف", surahNumber: 18, startVerseText: "وَاضْرِبْ لَهُم مَّثَلَ الرَّجُلَيْنِ", startVerseNumber: 32, approxPage: 297 },
  { rubNumber: 119, juz: 15, rubInJuz: 7, hizb: 30, rubInHizb: 3, surahName: "الكهف", surahNumber: 18, startVerseText: "الْمَالُ وَالْبَنُونَ زِينَةُ الْحَيَاةِ الدُّنْيَا", startVerseNumber: 46, approxPage: 299 },
  { rubNumber: 120, juz: 15, rubInJuz: 8, hizb: 30, rubInHizb: 4, surahName: "الكهف", surahNumber: 18, startVerseText: "وَإِذْ قَالَ مُوسَىٰ لِفَتَاهُ لَا أَبْرَحُ حَتَّىٰ أَبْلُغَ", startVerseNumber: 60, approxPage: 301 },

  // الجزء 16 (121 - 128)
  { rubNumber: 121, juz: 16, rubInJuz: 1, hizb: 31, rubInHizb: 1, surahName: "الكهف", surahNumber: 18, startVerseText: "قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ لَن تَسْتَطِيعَ مَعِيَ صَبْرًا", startVerseNumber: 75, approxPage: 302 },
  { rubNumber: 122, juz: 16, rubInJuz: 2, hizb: 31, rubInHizb: 2, surahName: "مريم", surahNumber: 19, startVerseText: "كهيعص ۝ ذِكْرُ رَحْمَتِ رَبِّكَ عَبْدَهُ زَكَرِيَّا", startVerseNumber: 1, approxPage: 305 },
  { rubNumber: 123, juz: 16, rubInJuz: 3, hizb: 31, rubInHizb: 3, surahName: "مريم", surahNumber: 19, startVerseText: "فَأَتَتْ بِهِ قَوْمَهَا تَحْمِلُهُ", startVerseNumber: 27, approxPage: 307 },
  { rubNumber: 124, juz: 16, rubInJuz: 4, hizb: 31, rubInHizb: 4, surahName: "مريم", surahNumber: 19, startVerseText: "أُولَٰئِكَ الَّذِينَ أَنْعَمَ اللَّهُ عَلَيْهِم", startVerseNumber: 58, approxPage: 310 },
  { rubNumber: 125, juz: 16, rubInJuz: 5, hizb: 32, rubInHizb: 1, surahName: "طه", surahNumber: 20, startVerseText: "طه ۝ مَا أَنزَلْنَا عَلَيْكَ الْقُرْآنَ لِتَشْقَىٰ", startVerseNumber: 1, approxPage: 312 },
  { rubNumber: 126, juz: 16, rubInJuz: 6, hizb: 32, rubInHizb: 2, surahName: "طه", surahNumber: 20, startVerseText: "وَهَلْ أَتَاكَ حَدِيثُ مُوسَىٰ", startVerseNumber: 9, approxPage: 313 },
  { rubNumber: 127, juz: 16, rubInJuz: 7, hizb: 32, rubInHizb: 3, surahName: "طه", surahNumber: 20, startVerseText: "فَقَالَ يَا قَوْمِ إِنَّكُمْ ظَلَمْتُمْ أَنفُسَكُمْ", startVerseNumber: 83, approxPage: 317 },
  { rubNumber: 128, juz: 16, rubInJuz: 8, hizb: 32, rubInHizb: 4, surahName: "طه", surahNumber: 20, startVerseText: "يَوْمَئِذٍ يَتَّبِعُونَ الدَّاعِيَ لَا عِوَجَ لَهُ", startVerseNumber: 108, approxPage: 319 },

  // الجزء 17 (129 - 136)
  { rubNumber: 129, juz: 17, rubInJuz: 1, hizb: 33, rubInHizb: 1, surahName: "الأنبياء", surahNumber: 21, startVerseText: "اقْتَرَبَ لِلنَّاسِ حِسَابُهُمْ وَهُمْ فِي غَفْلَةٍ", startVerseNumber: 1, approxPage: 322 },
  { rubNumber: 130, juz: 17, rubInJuz: 2, hizb: 33, rubInHizb: 2, surahName: "الأنبياء", surahNumber: 21, startVerseText: "أَمِ اتَّخَذُوا آلِهَةً مِّنَ الْأَرْضِ هُمْ يُنشِرُونَ", startVerseNumber: 21, approxPage: 323 },
  { rubNumber: 131, juz: 17, rubInJuz: 3, hizb: 33, rubInHizb: 3, surahName: "الأنبياء", surahNumber: 21, startVerseText: "وَلَقَدْ آتَيْنَا مُوسَىٰ وَهَارُونَ الْفُرْقَانَ", startVerseNumber: 48, approxPage: 326 },
  { rubNumber: 132, juz: 17, rubInJuz: 4, hizb: 33, rubInHizb: 4, surahName: "الأنبياء", surahNumber: 21, startVerseText: "وَأَيُّوبَ إِذْ نَادَىٰ رَبَّهُ أَنِّي مَسَّنِيَ الضُّرُّ", startVerseNumber: 83, approxPage: 329 },
  { rubNumber: 133, juz: 17, rubInJuz: 5, hizb: 34, rubInHizb: 1, surahName: "الحج", surahNumber: 22, startVerseText: "يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمْ ۚ إِنَّ زَلْزَلَةَ السَّاعَةِ", startVerseNumber: 1, approxPage: 332 },
  { rubNumber: 134, juz: 17, rubInJuz: 6, hizb: 34, rubInHizb: 2, surahName: "الحج", surahNumber: 22, startVerseText: "إِنَّ اللَّهَ يُدْخِلُ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ", startVerseNumber: 19, approxPage: 334 },
  { rubNumber: 135, juz: 17, rubInJuz: 7, hizb: 34, rubInHizb: 3, surahName: "الحج", surahNumber: 22, startVerseText: "ذَٰلِكَ وَمَن يُعَظِّمْ حُرُمَاتِ اللَّهِ", startVerseNumber: 30, approxPage: 336 },
  { rubNumber: 136, juz: 17, rubInJuz: 8, hizb: 34, rubInHizb: 4, surahName: "الحج", surahNumber: 22, startVerseText: "أَفَلَمْ يَسِيرُوا فِي الْأَرْضِ فَتَكُونَ لَهُمْ قُلُوبٌ", startVerseNumber: 46, approxPage: 338 },

  // الجزء 18 (137 - 144)
  { rubNumber: 137, juz: 18, rubInJuz: 1, hizb: 35, rubInHizb: 1, surahName: "المؤمنون", surahNumber: 23, startVerseText: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ", startVerseNumber: 1, approxPage: 342 },
  { rubNumber: 138, juz: 18, rubInJuz: 2, hizb: 35, rubInHizb: 2, surahName: "المؤمنون", surahNumber: 23, startVerseText: "وَلَقَدْ أَرْسَلْنَا نُوحًا إِلَىٰ قَوْمِهِ", startVerseNumber: 23, approxPage: 343 },
  { rubNumber: 139, juz: 18, rubInJuz: 3, hizb: 35, rubInHizb: 3, surahName: "المؤمنون", surahNumber: 23, startVerseText: "حَتَّىٰ إِذَا أَخَذْنَا مُتْرَفِيهِم بِالْعَذَابِ", startVerseNumber: 64, approxPage: 346 },
  { rubNumber: 140, juz: 18, rubInJuz: 4, hizb: 35, rubInHizb: 4, surahName: "النور", surahNumber: 24, startVerseText: "سُورَةٌ أَنزَلْنَاهَا وَفَرَضْنَاهَا", startVerseNumber: 1, approxPage: 350 },
  { rubNumber: 141, juz: 18, rubInJuz: 5, hizb: 36, rubInHizb: 1, surahName: "النور", surahNumber: 24, startVerseText: "إِنَّ الَّذِينَ جَاءُوا بِالْإِفْكِ عُصْبَةٌ مِّنكُمْ", startVerseNumber: 11, approxPage: 351 },
  { rubNumber: 142, juz: 18, rubInJuz: 6, hizb: 36, rubInHizb: 2, surahName: "النور", surahNumber: 24, startVerseText: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ", startVerseNumber: 35, approxPage: 354 },
  { rubNumber: 143, juz: 18, rubInJuz: 7, hizb: 36, rubInHizb: 3, surahName: "النور", surahNumber: 24, startVerseText: "أَلَمْ تَرَ أَنَّ اللَّهَ يُسَبِّحُ لَهُ مَن فِي السَّمَاوَاتِ", startVerseNumber: 41, approxPage: 355 },
  { rubNumber: 144, juz: 18, rubInJuz: 8, hizb: 36, rubInHizb: 4, surahName: "الفرقان", surahNumber: 25, startVerseText: "تَبَارَكَ الَّذِي نَزَّلَ الْفُرْقَانَ عَلَىٰ عَبْدِهِ", startVerseNumber: 1, approxPage: 359 },

  // الجزء 19 (145 - 152)
  { rubNumber: 145, juz: 19, rubInJuz: 1, hizb: 37, rubInHizb: 1, surahName: "الفرقان", surahNumber: 25, startVerseText: "وَقَالَ الَّذِينَ لَا يَرْجُونَ لِقَاءَنَا", startVerseNumber: 21, approxPage: 362 },
  { rubNumber: 146, juz: 19, rubInJuz: 2, hizb: 37, rubInHizb: 2, surahName: "الفرقان", surahNumber: 25, startVerseText: "أَلَمْ تَرَ إِلَىٰ رَبِّكَ كَيْفَ مَدَّ الظِّلَّ", startVerseNumber: 45, approxPage: 364 },
  { rubNumber: 147, juz: 19, rubInJuz: 3, hizb: 37, rubInHizb: 3, surahName: "الشعراء", surahNumber: 26, startVerseText: "طسم ۝ تِلْكَ آيَاتُ الْكِتَابِ الْمُبِينِ", startVerseNumber: 1, approxPage: 367 },
  { rubNumber: 148, juz: 19, rubInJuz: 4, hizb: 37, rubInHizb: 4, surahName: "الشعراء", surahNumber: 26, startVerseText: "قَالَ فَمَن رَّبُّكُمَا يَا مُوسَىٰ", startVerseNumber: 49, approxPage: 369 },
  { rubNumber: 149, juz: 19, rubInJuz: 5, hizb: 38, rubInHizb: 1, surahName: "الشعراء", surahNumber: 26, startVerseText: "وَاتْلُ عَلَيْهِمْ نَبَأَ إِبْرَاهِيمَ", startVerseNumber: 69, approxPage: 370 },
  { rubNumber: 150, juz: 19, rubInJuz: 6, hizb: 38, rubInHizb: 2, surahName: "الشعراء", surahNumber: 26, startVerseText: "كَذَّبَتْ قَوْمُ نُوحٍ الْمُرْسَلِينَ", startVerseNumber: 105, approxPage: 371 },
  { rubNumber: 151, juz: 19, rubInJuz: 7, hizb: 38, rubInHizb: 3, surahName: "الشعراء", surahNumber: 26, startVerseText: "وَمَا كَانَ رَبُّكَ لِيُهْلِكَ الْقُرَىٰ بِظُلْمٍ", startVerseNumber: 181, approxPage: 374 },
  { rubNumber: 152, juz: 19, rubInJuz: 8, hizb: 38, rubInHizb: 4, surahName: "النمل", surahNumber: 27, startVerseText: "طس ۚ تِلْكَ آيَاتُ الْقُرْآنِ وَكِتَابٍ مُّبِينٍ", startVerseNumber: 1, approxPage: 377 },

  // الجزء 20 (153 - 160)
  { rubNumber: 153, juz: 20, rubInJuz: 1, hizb: 39, rubInHizb: 1, surahName: "النمل", surahNumber: 27, startVerseText: "فَمَا كَانَ جَوَابَ قَوْمِهِ إِلَّا أَن قَالُوا", startVerseNumber: 56, approxPage: 382 },
  { rubNumber: 154, juz: 20, rubInJuz: 2, hizb: 39, rubInHizb: 2, surahName: "القصص", surahNumber: 28, startVerseText: "طسم ۝ تِلْكَ آيَاتُ الْكِتَابِ الْمُبِينِ", startVerseNumber: 1, approxPage: 385 },
  { rubNumber: 155, juz: 20, rubInJuz: 3, hizb: 39, rubInHizb: 3, surahName: "القصص", surahNumber: 28, startVerseText: "وَلَمَّا تَوَجَّهَ تِلْقَاءَ مَدْيَنَ", startVerseNumber: 22, approxPage: 388 },
  { rubNumber: 156, juz: 20, rubInJuz: 4, hizb: 39, rubInHizb: 4, surahName: "القصص", surahNumber: 28, startVerseText: "فَلَمَّا قَضَىٰ مُوسَى الْأَجَلَ وَسَارَ بِأَهْلِهِ", startVerseNumber: 29, approxPage: 389 },
  { rubNumber: 157, juz: 20, rubInJuz: 5, hizb: 40, rubInHizb: 1, surahName: "القصص", surahNumber: 28, startVerseText: "وَلَقَدْ وَصَّلْنَا لَهُمُ الْقَوْلَ لَعَلَّهُمْ يَتَذَكَّرُونَ", startVerseNumber: 51, approxPage: 392 },
  { rubNumber: 158, juz: 20, rubInJuz: 6, hizb: 40, rubInHizb: 2, surahName: "القصص", surahNumber: 28, startVerseText: "إِنَّ قَارُونَ كَانَ مِن قَوْمِ مُوسَىٰ", startVerseNumber: 76, approxPage: 395 },
  { rubNumber: 159, juz: 20, rubInJuz: 7, hizb: 40, rubInHizb: 3, surahName: "العنكبوت", surahNumber: 29, startVerseText: "الم ۝ أَحَسِبَ النَّاسُ أَن يُتْرَكُوا", startVerseNumber: 1, approxPage: 396 },
  { rubNumber: 160, juz: 20, rubInJuz: 8, hizb: 40, rubInHizb: 4, surahName: "العنكبوت", surahNumber: 29, startVerseText: "وَقَالَ إِنَّمَا اتَّخَذْتُم مِّن دُونِ اللَّهِ أَوْثَانًا", startVerseNumber: 26, approxPage: 399 },

  // الجزء 21 (161 - 168)
  { rubNumber: 161, juz: 21, rubInJuz: 1, hizb: 41, rubInHizb: 1, surahName: "العنكبوت", surahNumber: 29, startVerseText: "اتْلُ مَا أُوحِيَ إِلَيْكَ مِنَ الْكِتَابِ", startVerseNumber: 45, approxPage: 401 },
  { rubNumber: 162, juz: 21, rubInJuz: 2, hizb: 41, rubInHizb: 2, surahName: "الروم", surahNumber: 30, startVerseText: "الم ۝ غُلِبَتِ الرُّومُ", startVerseNumber: 1, approxPage: 404 },
  { rubNumber: 163, juz: 21, rubInJuz: 3, hizb: 41, rubInHizb: 3, surahName: "الروم", surahNumber: 30, startVerseText: "وَمِنْ آيَاتِهِ أَنْ خَلَقَكُم مِّن تُرَابٍ", startVerseNumber: 20, approxPage: 406 },
  { rubNumber: 164, juz: 21, rubInJuz: 4, hizb: 41, rubInHizb: 4, surahName: "الروم", surahNumber: 30, startVerseText: "اللَّهُ الَّذِي يُرْسِلُ الرِّيَاحَ فَتُثِيرُ سَحَابًا", startVerseNumber: 48, approxPage: 409 },
  { rubNumber: 165, juz: 21, rubInJuz: 5, hizb: 42, rubInHizb: 1, surahName: "لقمان", surahNumber: 31, startVerseText: "الم ۝ تِلْكَ آيَاتُ الْكِتَابِ الْحَكِيمِ", startVerseNumber: 1, approxPage: 411 },
  { rubNumber: 166, juz: 21, rubInJuz: 6, hizb: 42, rubInHizb: 2, surahName: "لقمان", surahNumber: 31, startVerseText: "وَلَقَدْ آتَيْنَا لُقْمَانَ الْحِكْمَةَ", startVerseNumber: 12, approxPage: 412 },
  { rubNumber: 167, juz: 21, rubInJuz: 7, hizb: 42, rubInHizb: 3, surahName: "السجدة", surahNumber: 32, startVerseText: "الم ۝ تَنزِيلُ الْكِتَابِ لَا رَيْبَ فِيهِ", startVerseNumber: 1, approxPage: 415 },
  { rubNumber: 168, juz: 21, rubInJuz: 8, hizb: 42, rubInHizb: 4, surahName: "الأحزاب", surahNumber: 33, startVerseText: "يَا أَيُّهَا النَّبِيُّ اتَّقِ اللَّهَ", startVerseNumber: 1, approxPage: 418 },

  // الجزء 22 (169 - 176)
  { rubNumber: 169, juz: 22, rubInJuz: 1, hizb: 43, rubInHizb: 1, surahName: "الأحزاب", surahNumber: 33, startVerseText: "وَمَن يَقْنُتْ مِنكُنَّ لِلَّهِ وَرَسُولِهِ", startVerseNumber: 31, approxPage: 422 },
  { rubNumber: 170, juz: 22, rubInJuz: 2, hizb: 43, rubInHizb: 2, surahName: "الأحزاب", surahNumber: 33, startVerseText: "يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا", startVerseNumber: 41, approxPage: 423 },
  { rubNumber: 171, juz: 22, rubInJuz: 3, hizb: 43, rubInHizb: 3, surahName: "الأحزاب", surahNumber: 33, startVerseText: "إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ", startVerseNumber: 56, approxPage: 426 },
  { rubNumber: 172, juz: 22, rubInJuz: 4, hizb: 43, rubInHizb: 4, surahName: "سبأ", surahNumber: 34, startVerseText: "الْحَمْدُ لِلَّهِ الَّذِي لَهُ مَا فِي السَّمَاوَاتِ", startVerseNumber: 1, approxPage: 428 },
  { rubNumber: 173, juz: 22, rubInJuz: 5, hizb: 44, rubInHizb: 1, surahName: "سبأ", surahNumber: 34, startVerseText: "قُلِ ادْعُوا الَّذِينَ زَعَمْتُم مِّن دُونِ اللَّهِ", startVerseNumber: 22, approxPage: 431 },
  { rubNumber: 174, juz: 22, rubInJuz: 6, hizb: 44, rubInHizb: 2, surahName: "سبأ", surahNumber: 34, startVerseText: "وَمَا أَرْسَلْنَا فِي قَرْيَةٍ مِّن نَّذِيرٍ", startVerseNumber: 34, approxPage: 432 },
  { rubNumber: 175, juz: 22, rubInJuz: 7, hizb: 44, rubInHizb: 3, surahName: "فاطر", surahNumber: 35, startVerseText: "الْحَمْدُ لِلَّهِ فَاطِرِ السَّمَاوَاتِ وَالْأَرْضِ", startVerseNumber: 1, approxPage: 434 },
  { rubNumber: 176, juz: 22, rubInJuz: 8, hizb: 44, rubInHizb: 4, surahName: "فاطر", surahNumber: 35, startVerseText: "يَا أَيُّهَا النَّاسُ أَنتُمُ الْفُقَرَاءُ إِلَى اللَّهِ", startVerseNumber: 15, approxPage: 436 },

  // الجزء 23 (177 - 184)
  { rubNumber: 177, juz: 23, rubInJuz: 1, hizb: 45, rubInHizb: 1, surahName: "يس", surahNumber: 36, startVerseText: "وَمَا أَنزَلْنَا عَلَىٰ قَوْمِهِ مِن بَعْدِهِ مِن جُندٍ", startVerseNumber: 28, approxPage: 442 },
  { rubNumber: 178, juz: 23, rubInJuz: 2, hizb: 45, rubInHizb: 2, surahName: "يس", surahNumber: 36, startVerseText: "وَامْتَازُوا الْيَوْمَ أَيُّهَا الْمُجْرِمُونَ", startVerseNumber: 59, approxPage: 444 },
  { rubNumber: 179, juz: 23, rubInJuz: 3, hizb: 45, rubInHizb: 3, surahName: "الصافات", surahNumber: 37, startVerseText: "وَالصَّافَّاتِ صَفًّا", startVerseNumber: 1, approxPage: 446 },
  { rubNumber: 180, juz: 23, rubInJuz: 4, hizb: 45, rubInHizb: 4, surahName: "الصافات", surahNumber: 37, startVerseText: "وَلَقَدْ نَادَانَا نُوحٌ فَلَنِعْمَ الْمُجِيبُونَ", startVerseNumber: 75, approxPage: 448 },
  { rubNumber: 181, juz: 23, rubInJuz: 5, hizb: 46, rubInHizb: 1, surahName: "الصافات", surahNumber: 37, startVerseText: "فَاسْتَفْتِهِمْ أَلِرَبِّكَ الْبَنَاتُ وَلَهُمُ الْبَنُونَ", startVerseNumber: 149, approxPage: 451 },
  { rubNumber: 182, juz: 23, rubInJuz: 6, hizb: 46, rubInHizb: 2, surahName: "ص", surahNumber: 38, startVerseText: "ص ۚ وَالْقُرْآنِ ذِي الذِّكْرِ", startVerseNumber: 1, approxPage: 453 },
  { rubNumber: 183, juz: 23, rubInJuz: 7, hizb: 46, rubInHizb: 3, surahName: "ص", surahNumber: 38, startVerseText: "وَاذْكُرْ عَبْدَنَا دَاوُودَ ذَا الْأَيْدِ", startVerseNumber: 17, approxPage: 454 },
  { rubNumber: 184, juz: 23, rubInJuz: 8, hizb: 46, rubInHizb: 4, surahName: "الزمر", surahNumber: 39, startVerseText: "تَنزِيلُ الْكِتَابِ مِنَ اللَّهِ الْعَزِيزِ الْحَكِيمِ", startVerseNumber: 1, approxPage: 458 },

  // الجزء 24 (185 - 192)
  { rubNumber: 185, juz: 24, rubInJuz: 1, hizb: 47, rubInHizb: 1, surahName: "الزمر", surahNumber: 39, startVerseText: "فَمَنْ أَظْلَمُ مِمَّن كَذَبَ عَلَى اللَّهِ", startVerseNumber: 32, approxPage: 462 },
  { rubNumber: 186, juz: 24, rubInJuz: 2, hizb: 47, rubInHizb: 2, surahName: "الزمر", surahNumber: 39, startVerseText: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ", startVerseNumber: 53, approxPage: 464 },
  { rubNumber: 187, juz: 24, rubInJuz: 3, hizb: 47, rubInHizb: 3, surahName: "غافر", surahNumber: 40, startVerseText: "حم ۝ تَنزِيلُ الْكِتَابِ مِنَ اللَّهِ", startVerseNumber: 1, approxPage: 467 },
  { rubNumber: 188, juz: 24, rubInJuz: 4, hizb: 47, rubInHizb: 4, surahName: "غافر", surahNumber: 40, startVerseText: "وَقَالَ رَجُلٌ مُّؤْمِنٌ مِّنْ آلِ فِرْعَوْنَ", startVerseNumber: 28, approxPage: 470 },
  { rubNumber: 189, juz: 24, rubInJuz: 5, hizb: 48, rubInHizb: 1, surahName: "غافر", surahNumber: 40, startVerseText: "وَإِذْ يَتَحَاجُّونَ فِي النَّارِ", startVerseNumber: 47, approxPage: 473 },
  { rubNumber: 190, juz: 24, rubInJuz: 6, hizb: 48, rubInHizb: 2, surahName: "غافر", surahNumber: 40, startVerseText: "وَلَقَدْ أَرْسَلْنَا رُسُلًا مِّن قَبْلِكَ", startVerseNumber: 78, approxPage: 476 },
  { rubNumber: 191, juz: 24, rubInJuz: 7, hizb: 48, rubInHizb: 3, surahName: "فصلت", surahNumber: 41, startVerseText: "حم ۝ تَنزِيلٌ مِّنَ الرَّحْمَٰنِ الرَّحِيمِ", startVerseNumber: 1, approxPage: 477 },
  { rubNumber: 192, juz: 24, rubInJuz: 8, hizb: 48, rubInHizb: 4, surahName: "فصلت", surahNumber: 41, startVerseText: "إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا", startVerseNumber: 30, approxPage: 480 },

  // الجزء 25 (193 - 200)
  { rubNumber: 193, juz: 25, rubInJuz: 1, hizb: 49, rubInHizb: 1, surahName: "فصلت", surahNumber: 41, startVerseText: "إِلَيْهِ يُرَدُّ عِلْمُ السَّاعَةِ", startVerseNumber: 47, approxPage: 482 },
  { rubNumber: 194, juz: 25, rubInJuz: 2, hizb: 49, rubInHizb: 2, surahName: "الشورى", surahNumber: 42, startVerseText: "حم ۝ عسق ۝ كَذَٰلِكَ يُوحِي إِلَيْكَ", startVerseNumber: 1, approxPage: 483 },
  { rubNumber: 195, juz: 25, rubInJuz: 3, hizb: 49, rubInHizb: 3, surahName: "الشورى", surahNumber: 42, startVerseText: "وَالَّذِينَ اتَّخَذُوا مِن دُونِهِ أَوْلِيَاءَ", startVerseNumber: 6, approxPage: 484 },
  { rubNumber: 196, juz: 25, rubInJuz: 4, hizb: 49, rubInHizb: 4, surahName: "الشورى", surahNumber: 42, startVerseText: "وَهُوَ الَّذِي يَقْبَلُ التَّوْبَةَ عَنْ عِبَادِهِ", startVerseNumber: 25, approxPage: 486 },
  { rubNumber: 197, juz: 25, rubInJuz: 5, hizb: 50, rubInHizb: 1, surahName: "الزخرف", surahNumber: 43, startVerseText: "حم ۝ وَالْكِتَابِ الْمُبِينِ", startVerseNumber: 1, approxPage: 489 },
  { rubNumber: 198, juz: 25, rubInJuz: 6, hizb: 50, rubInHizb: 2, surahName: "الزخرف", surahNumber: 43, startVerseText: "وَلَمَّا ضُرِبَ ابْنُ مَرْيَمَ مَثَلًا إِذَا قَوْمُكَ", startVerseNumber: 57, approxPage: 493 },
  { rubNumber: 199, juz: 25, rubInJuz: 7, hizb: 50, rubInHizb: 3, surahName: "الدخان", surahNumber: 44, startVerseText: "حم ۝ وَالْكِتَابِ الْمُبِينِ ۝ إِنَّا أَنزَلْنَاهُ فِي لَيْلَةٍ مُّبَارَكَةٍ", startVerseNumber: 1, approxPage: 496 },
  { rubNumber: 200, juz: 25, rubInJuz: 8, hizb: 50, rubInHizb: 4, surahName: "الجاثية", surahNumber: 45, startVerseText: "حم ۝ تَنزِيلُ الْكِتَابِ مِنَ اللَّهِ الْعَزِيزِ الْحَكِيمِ", startVerseNumber: 1, approxPage: 499 },

  // الجزء 26 (201 - 208)
  { rubNumber: 201, juz: 26, rubInJuz: 1, hizb: 51, rubInHizb: 1, surahName: "الأحقاف", surahNumber: 46, startVerseText: "حم ۝ تَنزِيلُ الْكِتَابِ مِنَ اللَّهِ الْعَزِيزِ الْحَكِيمِ", startVerseNumber: 1, approxPage: 502 },
  { rubNumber: 202, juz: 26, rubInJuz: 2, hizb: 51, rubInHizb: 2, surahName: "الأحقاف", surahNumber: 46, startVerseText: "وَاذْكُرْ أَخَا عَادٍ إِذْ أَنذَرَ قَوْمَهُ بِالْأَحْقَافِ", startVerseNumber: 21, approxPage: 505 },
  { rubNumber: 203, juz: 26, rubInJuz: 3, hizb: 51, rubInHizb: 3, surahName: "محمد", surahNumber: 47, startVerseText: "الَّذِينَ كَفَرُوا وَصَدُّوا عَن سَبِيلِ اللَّهِ", startVerseNumber: 1, approxPage: 507 },
  { rubNumber: 204, juz: 26, rubInJuz: 4, hizb: 51, rubInHizb: 4, surahName: "محمد", surahNumber: 47, startVerseText: "مَّثَلُ الْجَنَّةِ الَّتِي وُعِدَ الْمُتَّقُونَ", startVerseNumber: 15, approxPage: 508 },
  { rubNumber: 205, juz: 26, rubInJuz: 5, hizb: 52, rubInHizb: 1, surahName: "الفتح", surahNumber: 48, startVerseText: "إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا", startVerseNumber: 1, approxPage: 511 },
  { rubNumber: 206, juz: 26, rubInJuz: 6, hizb: 52, rubInHizb: 2, surahName: "الفتح", surahNumber: 48, startVerseText: "لَّقَدْ رَضِيَ اللَّهُ عَنِ الْمُؤْمِنِينَ إِذْ يُبَايِعُونَكَ", startVerseNumber: 18, approxPage: 513 },
  { rubNumber: 207, juz: 26, rubInJuz: 7, hizb: 52, rubInHizb: 3, surahName: "الحجرات", surahNumber: 49, startVerseText: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تُقَدِّمُوا بَيْنَ يَدَيِ اللَّهِ", startVerseNumber: 1, approxPage: 515 },
  { rubNumber: 208, juz: 26, rubInJuz: 8, hizb: 52, rubInHizb: 4, surahName: "ق", surahNumber: 50, startVerseText: "ق ۚ وَالْقُرْآنِ الْمَجِيدِ", startVerseNumber: 1, approxPage: 518 },

  // الجزء 27 (209 - 216)
  { rubNumber: 209, juz: 27, rubInJuz: 1, hizb: 53, rubInHizb: 1, surahName: "الذاريات", surahNumber: 51, startVerseText: "قَالَ فَمَا خَطْبُكُمْ أَيُّهَا الْمُرْسَلُونَ", startVerseNumber: 31, approxPage: 522 },
  { rubNumber: 210, juz: 27, rubInJuz: 2, hizb: 53, rubInHizb: 2, surahName: "الطور", surahNumber: 52, startVerseText: "وَالطُّورِ ۝ وَكِتَابٍ مَّسْطُورٍ", startVerseNumber: 1, approxPage: 523 },
  { rubNumber: 211, juz: 27, rubInJuz: 3, hizb: 53, rubInHizb: 3, surahName: "النجم", surahNumber: 53, startVerseText: "وَالنَّجْمِ إِذَا هَوَىٰ", startVerseNumber: 1, approxPage: 526 },
  { rubNumber: 212, juz: 27, rubInJuz: 4, hizb: 53, rubInHizb: 4, surahName: "القمر", surahNumber: 54, startVerseText: "اقْتَرَبَتِ السَّاعَةُ وَانشَقَّ الْقَمَرُ", startVerseNumber: 1, approxPage: 528 },
  { rubNumber: 213, juz: 27, rubInJuz: 5, hizb: 54, rubInHizb: 1, surahName: "الرحمن", surahNumber: 55, startVerseText: "الرَّحْمَٰنُ ۝ عَلَّمَ الْقُرْآنَ", startVerseNumber: 1, approxPage: 531 },
  { rubNumber: 214, juz: 27, rubInJuz: 6, hizb: 54, rubInHizb: 2, surahName: "الواقعة", surahNumber: 56, startVerseText: "إِذَا وَقَعَتِ الْوَاقِعَةُ", startVerseNumber: 1, approxPage: 534 },
  { rubNumber: 215, juz: 27, rubInJuz: 7, hizb: 54, rubInHizb: 3, surahName: "الحديد", surahNumber: 57, startVerseText: "سَبَّحَ لِلَّهِ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ", startVerseNumber: 1, approxPage: 537 },
  { rubNumber: 216, juz: 27, rubInJuz: 8, hizb: 54, rubInHizb: 4, surahName: "الحديد", surahNumber: 57, startVerseText: "أَلَمْ يَأْنِ لِلَّذِينَ آمَنُوا أَن تَخْشَعَ قُلُوبُهُمْ", startVerseNumber: 16, approxPage: 539 },

  // الجزء 28 (217 - 224)
  { rubNumber: 217, juz: 28, rubInJuz: 1, hizb: 55, rubInHizb: 1, surahName: "المجادلة", surahNumber: 58, startVerseText: "قَدْ سَمِعَ اللَّهُ قَوْلَ الَّتِي تُجَادِلُكَ فِي زَوْجِهَا", startVerseNumber: 1, approxPage: 542 },
  { rubNumber: 218, juz: 28, rubInJuz: 2, hizb: 55, rubInHizb: 2, surahName: "الحشر", surahNumber: 59, startVerseText: "سَبَّحَ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ", startVerseNumber: 1, approxPage: 545 },
  { rubNumber: 219, juz: 28, rubInJuz: 3, hizb: 55, rubInHizb: 3, surahName: "الحشر", surahNumber: 59, startVerseText: "مَّا أَفَاءَ اللَّهُ عَلَىٰ رَسُولِهِ مِنْ أَهْلِ الْقُرَىٰ", startVerseNumber: 7, approxPage: 546 },
  { rubNumber: 220, juz: 28, rubInJuz: 4, hizb: 55, rubInHizb: 4, surahName: "الممتحنة", surahNumber: 60, startVerseText: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَتَّخِذُوا عَدُوِّي وَعَدُوَّكُمْ أَوْلِيَاءَ", startVerseNumber: 1, approxPage: 549 },
  { rubNumber: 221, juz: 28, rubInJuz: 5, hizb: 56, rubInHizb: 1, surahName: "الصف", surahNumber: 61, startVerseText: "سَبَّحَ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ", startVerseNumber: 1, approxPage: 551 },
  { rubNumber: 222, juz: 28, rubInJuz: 6, hizb: 56, rubInHizb: 2, surahName: "الجمعة", surahNumber: 62, startVerseText: "يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ", startVerseNumber: 1, approxPage: 553 },
  { rubNumber: 223, juz: 28, rubInJuz: 7, hizb: 56, rubInHizb: 3, surahName: "المنافقون", surahNumber: 63, startVerseText: "إِذَا جَاءَكَ الْمُنَافِقُونَ قَالُوا نَشْهَدُ", startVerseNumber: 1, approxPage: 554 },
  { rubNumber: 224, juz: 28, rubInJuz: 8, hizb: 56, rubInHizb: 4, surahName: "التحريم", surahNumber: 66, startVerseText: "يَا أَيُّهَا النَّبِيُّ لِمَ تُحَرِّمُ مَا أَحَلَّ اللَّهُ لَكَ", startVerseNumber: 1, approxPage: 560 },

  // الجزء 29 (225 - 232)
  { rubNumber: 225, juz: 29, rubInJuz: 1, hizb: 57, rubInHizb: 1, surahName: "الملك", surahNumber: 67, startVerseText: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ", startVerseNumber: 1, approxPage: 562 },
  { rubNumber: 226, juz: 29, rubInJuz: 2, hizb: 57, rubInHizb: 2, surahName: "القلم", surahNumber: 68, startVerseText: "ن ۚ وَالْقَلَمِ وَمَا يَسْطُرُونَ", startVerseNumber: 1, approxPage: 564 },
  { rubNumber: 227, juz: 29, rubInJuz: 3, hizb: 57, rubInHizb: 3, surahName: "الحاقة", surahNumber: 69, startVerseText: "الْحَاقَّةُ ۝ مَا الْحَاقَّةُ", startVerseNumber: 1, approxPage: 566 },
  { rubNumber: 228, juz: 29, rubInJuz: 4, hizb: 57, rubInHizb: 4, surahName: "المعارج", surahNumber: 70, startVerseText: "سَأَلَ سَائِلٌ بِعَذَابٍ وَاقِعٍ", startVerseNumber: 1, approxPage: 568 },
  { rubNumber: 229, juz: 29, rubInJuz: 5, hizb: 58, rubInHizb: 1, surahName: "نوح", surahNumber: 71, startVerseText: "إِنَّا أَرْسَلْنَا نُوحًا إِلَىٰ قَوْمِهِ", startVerseNumber: 1, approxPage: 570 },
  { rubNumber: 230, juz: 29, rubInJuz: 6, hizb: 58, rubInHizb: 2, surahName: "الجن", surahNumber: 72, startVerseText: "قُلْ أُوحِيَ إِلَيَّ أَنَّهُ اسْتَمَعَ نَفَرٌ مِّنَ الْجِنِّ", startVerseNumber: 1, approxPage: 572 },
  { rubNumber: 231, juz: 29, rubInJuz: 7, hizb: 58, rubInHizb: 3, surahName: "المزمل", surahNumber: 73, startVerseText: "يَا أَيُّهَا الْمُزَّمِّلُ ۝ قُمِ اللَّيْلَ إِلَّا قَلِيلًا", startVerseNumber: 1, approxPage: 574 },
  { rubNumber: 232, juz: 29, rubInJuz: 8, hizb: 58, rubInHizb: 4, surahName: "المدثر", surahNumber: 74, startVerseText: "يَا أَيُّهَا الْمُدَّثِّرُ ۝ قُمْ فَأَنذِرْ", startVerseNumber: 1, approxPage: 575 },

  // الجزء 30 (233 - 240)
  { rubNumber: 233, juz: 30, rubInJuz: 1, hizb: 59, rubInHizb: 1, surahName: "النبأ", surahNumber: 78, startVerseText: "عَمَّ يَتَسَاءَلُونَ ۝ عَنِ النَّبَإِ الْعَظِيمِ", startVerseNumber: 1, approxPage: 582 },
  { rubNumber: 234, juz: 30, rubInJuz: 2, hizb: 59, rubInHizb: 2, surahName: "النازعات", surahNumber: 79, startVerseText: "وَالنَّازِعَاتِ غَرْقًا", startVerseNumber: 1, approxPage: 583 },
  { rubNumber: 235, juz: 30, rubInJuz: 3, hizb: 59, rubInHizb: 3, surahName: "عبس", surahNumber: 80, startVerseText: "عَبَسَ وَتَوَلَّىٰ ۝ أَن جَاءَهُ الْأَعْمَىٰ", startVerseNumber: 1, approxPage: 585 },
  { rubNumber: 236, juz: 30, rubInJuz: 4, hizb: 59, rubInHizb: 4, surahName: "التكوير", surahNumber: 81, startVerseText: "إِذَا الشَّمْسُ كُوِّرَتْ", startVerseNumber: 1, approxPage: 586 },
  { rubNumber: 237, juz: 30, rubInJuz: 5, hizb: 60, rubInHizb: 1, surahName: "المطففين", surahNumber: 83, startVerseText: "وَيْلٌ لِّلْمُطَفِّفِينَ", startVerseNumber: 1, approxPage: 587 },
  { rubNumber: 238, juz: 30, rubInJuz: 6, hizb: 60, rubInHizb: 2, surahName: "الطارق", surahNumber: 86, startVerseText: "وَالسَّمَاءِ وَالطَّارِقِ", startVerseNumber: 1, approxPage: 591 },
  { rubNumber: 239, juz: 30, rubInJuz: 7, hizb: 60, rubInHizb: 3, surahName: "الفجر", surahNumber: 89, startVerseText: "وَالْفَجْرِ ۝ وَلَيَالٍ عَشْرٍ", startVerseNumber: 1, approxPage: 593 },
  { rubNumber: 240, juz: 30, rubInJuz: 8, hizb: 60, rubInHizb: 4, surahName: "الضحى", surahNumber: 93, startVerseText: "وَالضُّحَىٰ ۝ وَاللَّيْلِ إِذَا سَجَىٰ (حتى سورة الناس)", startVerseNumber: 1, approxPage: 596 },
];

export function getQuarterByNumber(num: number): QuranQuarter | undefined {
  return QURAN_QUARTERS.find(q => q.rubNumber === num);
}

export const getQuarterDetails = getQuarterByNumber;

export function formatQuarterLabel(num: number, full: boolean = false): string {
  const q = getQuarterByNumber(num);
  if (!q) return `الربع ${num}`;
  if (full) {
    return `الربع ${num} (الجزء ${q.juz} - ربع ${q.rubInJuz} | سورة ${q.surahName}: "${q.startVerseText.slice(0, 30)}...")`;
  }
  return `الربع ${num}: ${q.surahName} (${q.startVerseText.slice(0, 24)}...)`;
}

export function getQuartersInJuz(juz: number): QuranQuarter[] {
  return QURAN_QUARTERS.filter(q => q.juz === juz);
}

export interface JuzMeta {
  juzNumber: number;
  name: string;
  popularName: string;
  startRub: number;
  endRub: number;
  mainSurah: string;
}

export const JUZ_METADATA: JuzMeta[] = [
  { juzNumber: 1, name: "الم", popularName: "الجزء 1 (الم - الفاتحة والبقرة)", startRub: 1, endRub: 8, mainSurah: "الفاتحة والبقرة" },
  { juzNumber: 2, name: "سيقول السفهاء", popularName: "الجزء 2 (سيقول السفهاء)", startRub: 9, endRub: 16, mainSurah: "البقرة" },
  { juzNumber: 3, name: "تلك الرسل", popularName: "الجزء 3 (تلك الرسل)", startRub: 17, endRub: 24, mainSurah: "البقرة وآل عمران" },
  { juzNumber: 4, name: "لن تنالوا البر", popularName: "الجزء 4 (لن تنالوا البر)", startRub: 25, endRub: 32, mainSurah: "آل عمران والنساء" },
  { juzNumber: 5, name: "والمحصنات", popularName: "الجزء 5 (والمحصنات)", startRub: 33, endRub: 40, mainSurah: "النساء" },
  { juzNumber: 6, name: "لا يحب الله", popularName: "الجزء 6 (لا يحب الله)", startRub: 41, endRub: 48, mainSurah: "النساء والمائدة" },
  { juzNumber: 7, name: "وإذا سمعوا", popularName: "الجزء 7 (وإذا سمعوا)", startRub: 49, endRub: 56, mainSurah: "المائدة والأنعام" },
  { juzNumber: 8, name: "ولو أننا نزلنا", popularName: "الجزء 8 (ولو أننا)", startRub: 57, endRub: 64, mainSurah: "الأنعام والأعراف" },
  { juzNumber: 9, name: "قال الملأ", popularName: "الجزء 9 (قال الملأ)", startRub: 65, endRub: 72, mainSurah: "الأعراف والأنفال" },
  { juzNumber: 10, name: "واعلموا أنما", popularName: "الجزء 10 (واعلموا)", startRub: 73, endRub: 80, mainSurah: "الأنفال والتوبة" },
  { juzNumber: 11, name: "يعتذرون إليكم", popularName: "الجزء 11 (يعتذرون)", startRub: 81, endRub: 88, mainSurah: "التوبة ويونس" },
  { juzNumber: 12, name: "وما من دابة", popularName: "الجزء 12 (وما من دابة)", startRub: 89, endRub: 96, mainSurah: "هود ويوسف" },
  { juzNumber: 13, name: "وما أبرئ نفسي", popularName: "الجزء 13 (وما أبرئ نفسي)", startRub: 97, endRub: 104, mainSurah: "يوسف والرعد وإبراهيم" },
  { juzNumber: 14, name: "ربما يود", popularName: "الجزء 14 (ربما يود)", startRub: 105, endRub: 112, mainSurah: "الحجر والنحل" },
  { juzNumber: 15, name: "سبحان الذي أسرى", popularName: "الجزء 15 (سبحان)", startRub: 113, endRub: 120, mainSurah: "الإسراء والكهف" },
  { juzNumber: 16, name: "قال ألم أقل لك", popularName: "الجزء 16 (قال ألم)", startRub: 121, endRub: 128, mainSurah: "الكهف ومريم وطه" },
  { juzNumber: 17, name: "اقترب للناس", popularName: "الجزء 17 (اقترب للناس)", startRub: 129, endRub: 136, mainSurah: "الأنبياء والحج" },
  { juzNumber: 18, name: "قد أفلح المؤمنون", popularName: "الجزء 18 (قد أفلح)", startRub: 137, endRub: 144, mainSurah: "المؤمنون والنور والفرقان" },
  { juzNumber: 19, name: "وقال الذين لا يرجون", popularName: "الجزء 19 (وقال الذين)", startRub: 145, endRub: 152, mainSurah: "الفرقان والشعراء والنمل" },
  { juzNumber: 20, name: "فما كان جواب قومه", popularName: "الجزء 20 (فما كان جواب قومه)", startRub: 153, endRub: 160, mainSurah: "النمل والقصص والعنكبوت" },
  { juzNumber: 21, name: "ولا تجادلوا", popularName: "الجزء 21 (ولا تجادلوا)", startRub: 161, endRub: 168, mainSurah: "العنكبوت والروم ولقمان والسجدة والأحزاب" },
  { juzNumber: 22, name: "ومن يقنت", popularName: "الجزء 22 (ومن يقنت)", startRub: 169, endRub: 176, mainSurah: "الأحزاب وسبأ وفاطر ويس" },
  { juzNumber: 23, name: "وما أنزلنا", popularName: "الجزء 23 (وما أنزلنا)", startRub: 177, endRub: 184, mainSurah: "يس والصافات وص والزمر" },
  { juzNumber: 24, name: "فمن أظلم", popularName: "الجزء 24 (فمن أظلم)", startRub: 185, endRub: 192, mainSurah: "الزمر وغافر وفصلت" },
  { juzNumber: 25, name: "إليه يرد علم الساعة", popularName: "الجزء 25 (إليه يرد)", startRub: 193, endRub: 200, mainSurah: "فصلت والشورى والزخرف والدخان والجاثية" },
  { juzNumber: 26, name: "حم (الأحقاف)", popularName: "الجزء 26 (حم الأحقاف)", startRub: 201, endRub: 208, mainSurah: "الأحقاف والفتح والحجرات وق" },
  { juzNumber: 27, name: "قال فما خطبكم", popularName: "الجزء 27 (قال فما خطبكم)", startRub: 209, endRub: 216, mainSurah: "الذاريات والطور والرحمن والواقعة والحديد" },
  { juzNumber: 28, name: "قد سمع الله", popularName: "الجزء 28 (قد سمع الله)", startRub: 217, endRub: 224, mainSurah: "المجادلة والحشر والجمعة والتحريم" },
  { juzNumber: 29, name: "تبارك الذي بيده الملك", popularName: "الجزء 29 (تبارك)", startRub: 225, endRub: 232, mainSurah: "الملك والقلم والمزمل والمدثر" },
  { juzNumber: 30, name: "عم يتساءلون", popularName: "الجزء 30 (عم يتساءلون)", startRub: 233, endRub: 240, mainSurah: "النبأ إلى الناس" },
];
