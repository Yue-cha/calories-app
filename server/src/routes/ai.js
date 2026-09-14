const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../db');
const { computeFullProfileStats } = require('../utils/calculator');

const router = express.Router();
router.use(authenticateToken);

// Rich curated database of authentic Vietnamese nutritious meals
// Each entry includes full macros, exact ingredient quantities, and step-by-step recipe instructions
const CURATED_MEALS = {
  breakfast: [
    {
      name: 'Yến mạch nấu sữa đậu nành & Chuối chín',
      calories: 320,
      protein: 16,
      carbs: 52,
      fat: 6,
      fiber: 7,
      prepTime: '10 phút',
      difficulty: 'Rất dễ',
      tags: ['Thuần chay', 'Giàu chất xơ', 'Nhanh gọn'],
      whyGood: 'Cung cấp năng lượng giải phóng chậm, giúp no lâu và ổn định đường huyết suốt buổi sáng.',
      ingredients: [
        '50g yến mạch cán dẹt (hoặc cán vỡ)',
        '200ml sữa đậu nành không đường',
        '1 quả chuối sứ chín vừa (80g)',
        '1 thìa cà phê hạt chia hoặc hạnh nhân lát (5g)',
        'Một nhúm nhỏ bột quế (tùy chọn)',
      ],
      instructions: [
        'Bước 1: Cho 50g yến mạch và 200ml sữa đậu nành vào nồi nhỏ.',
        'Bước 2: Đun lửa vừa trong khoảng 3 - 5 phút, khuấy đều tay đến khi yến mạch nở mềm sánh mịn.',
        'Bước 3: Múc yến mạch ra bát, chuối lột vỏ thái lát xếp lên bề mặt.',
        'Bước 4: Rắc thêm hạt chia, hạnh nhân và chút bột quế rồi thưởng thức khi còn ấm.',
      ],
    },
    {
      name: 'Trứng ốp la 2 quả & Bánh mì nguyên cám kèm dưa leo',
      calories: 360,
      protein: 22,
      carbs: 32,
      fat: 14,
      fiber: 4,
      prepTime: '10 phút',
      difficulty: 'Dễ',
      tags: ['Giàu protein', 'Phổ biến', 'Dễ làm'],
      whyGood: 'Lượng đạm cao từ trứng giúp xây dựng cơ bắp, kết hợp tinh bột chậm từ bánh mì đen giúp tỉnh táo.',
      ingredients: [
        '2 quả trứng gà ta tươi',
        '2 lát bánh mì ngũ cốc nguyên cám (khoảng 60g)',
        '1 quả dưa leo nhỏ và vài cọng ngò rí',
        '1/2 thìa cà phê dầu ô liu (quét chảo)',
        'Gia vị: Tiêu đen xay, 1/2 thìa nước tương tỏi ớt',
      ],
      instructions: [
        'Bước 1: Làm nóng chảo chống dính với một lớp mỏng dầu ô liu.',
        'Bước 2: Đập 2 quả trứng vào chảo, rắc chút tiêu xay, chiên lòng đào hoặc chín tùy sở thích.',
        'Bước 3: Nướng giòn 2 lát bánh mì nguyên cám bằng máy nướng hoặc áp chảo khô.',
        'Bước 4: Rửa sạch dưa leo, thái lát mỏng. Kẹp trứng và dưa leo vào bánh mì, chấm kèm chút nước tương.',
      ],
    },
    {
      name: 'Phở bò tái nạc nêm thanh đạm',
      calories: 420,
      protein: 34,
      carbs: 55,
      fat: 8,
      fiber: 3,
      prepTime: '20 phút',
      difficulty: 'Trung bình',
      tags: ['Đậm đà', 'Chuẩn vị Việt', 'Giàu đạm nạc'],
      whyGood: 'Thịt bò thăn giàu sắt và đạm sinh học cao, nước dùng thanh đạm ít béo không gây đầy bụng.',
      ingredients: [
        '120g bánh phở tươi trần kỹ qua nước sôi',
        '100g thịt thăn bò tươi thái thật mỏng',
        '350ml nước hầm xương ống lọc bỏ váng mỡ',
        'Hành lá, hành tây thái mỏng, rau mùi, húng quế',
        '1 góc chanh tươi, vài lát ớt hiểm, hạt tiêu xay',
      ],
      instructions: [
        'Bước 1: Trần bánh phở qua nước sôi khoảng 15 giây rồi vớt ra tô lớn.',
        'Bước 2: Xếp hành tây thái mỏng, hành lá và ngò gai lên trên bánh phở.',
        'Bước 3: Thịt bò thái mỏng ướp nhẹ chút gừng băm, chần nhanh qua nước dùng sôi cho vừa chín tái hồng.',
        'Bước 4: Múc thịt bò lên bát, chan nước dùng thật sôi vào tô, vắt chanh, thêm tiêu ớt và thưởng thức nóng.',
      ],
    },
    {
      name: 'Bánh mì ức gà nướng mật ong & Rau củ chua',
      calories: 390,
      protein: 31,
      carbs: 48,
      fat: 7,
      fiber: 5,
      prepTime: '15 phút',
      difficulty: 'Dễ',
      tags: ['Giàu đạm', 'Nhanh gọn', 'Dễ mang theo'],
      whyGood: 'Nguồn đạm nạc tinh khiết kết hợp chất xơ từ đồ chua giúp hỗ trợ tiêu hóa rất tốt.',
      ingredients: [
        '1 ổ bánh mì truyền thống giòn rụm (loại vừa)',
        '100g ức gà phi lê thái miếng vừa ăn',
        '50g đồ chua (cà rốt, củ cải ngâm giấm đường nhẹ)',
        'Dưa leo thái lát, rau mùi (ngò rí)',
        'Gia vị ướp: 1 thìa cà phê mật ong, 1 thìa nước tương, tỏi băm, tiêu',
      ],
      instructions: [
        'Bước 1: Ướp ức gà với mật ong, nước tương, tỏi băm và tiêu trong 10 phút.',
        'Bước 2: Áp chảo ức gà bằng chảo chống dính hoặc nồi chiên không dầu ở 180°C trong 8-10 phút.',
        'Bước 3: Rạch dọc ổ bánh mì, quết chút sốt tương nhẹ hoặc tương ớt nếu thích cay.',
        'Bước 4: Xếp dưa leo, ức gà nướng xé hoặc thái lát, thêm đồ chua và rau mùi rồi kẹp chặt lại.',
      ],
    },
  ],

  lunch: [
    {
      name: 'Cơm gạo lứt, ức gà xào sả ớt & Bông cải luộc',
      calories: 460,
      protein: 42,
      carbs: 54,
      fat: 7,
      fiber: 8,
      prepTime: '20 phút',
      difficulty: 'Dễ',
      tags: ['Clean Eating', 'Tăng cơ giảm mỡ', 'Ít calo'],
      whyGood: 'Cung cấp tới 42g protein giúp phục hồi và giữ cơ bắp khi đang thâm hụt calo, giàu xơ từ bông cải xanh.',
      ingredients: [
        '1 bát cơm gạo lứt nấu dẻo (khoảng 130g cơm)',
        '150g ức gà tươi thái hạt lựu hoặc miếng mỏng',
        '150g bông cải xanh (súp lơ xanh) cắt khúc nhỏ',
        '1 củ sả băm nhuyễn, 1 quả ớt hiểm, 2 nhánh tỏi băm',
        '1 thìa cà phê dầu ô liu, 1 thìa nước mắm ngon, tiêu',
      ],
      instructions: [
        'Bước 1: Luộc bông cải xanh trong nước sôi có chút muối khoảng 3 phút rồi vớt ra ngâm nước mát cho giòn xanh.',
        'Bước 2: Ướp ức gà với sả băm, ớt, tỏi, 1 thìa nước mắm và chút tiêu trong 5 phút.',
        'Bước 3: Đun nóng chảo với 1 thìa cà phê dầu ô liu, cho gà vào xào săn trên lửa lớn đến khi chín vàng thơm.',
        'Bước 4: Bày cơm gạo lứt ra đĩa, xếp bông cải xanh và ức gà xào sả ớt bên cạnh để thưởng thức.',
      ],
    },
    {
      name: 'Cá hồi áp chảo sốt bơ tỏi & Khoai lang hấp, Salad',
      calories: 520,
      protein: 38,
      carbs: 45,
      fat: 18,
      fiber: 6,
      prepTime: '20 phút',
      difficulty: 'Dễ',
      tags: ['Omega-3', 'Tốt cho tim mạch', 'Chất béo tốt'],
      whyGood: 'Nguồn axit béo Omega-3 quý giá giúp giảm viêm, chống oxy hóa và cải thiện độ nhạy insulin.',
      ingredients: [
        '130g phi lê cá hồi tươi có da hoặc bỏ da',
        '1 củ khoai lang vàng hoặc tím cỡ vừa (120g)',
        '100g rau xà lách, cà chua bi, dưa chuột',
        '5g bơ lạt (1 thìa nhỏ), 2 tép tỏi đập dập, 1 lát chanh',
        'Gia vị: Muối hồng, tiêu đen xay, 1 thìa dầu giấm salad',
      ],
      instructions: [
        'Bước 1: Rửa sạch khoai lang, cắt khoanh và đem hấp chín trong 15 phút.',
        'Bước 2: Cá hồi thấm thật khô, rắc nhẹ chút muối và tiêu lên hai mặt.',
        'Bước 3: Đặt chảo lên bếp, áp chảo mặt da cá hồi 3-4 phút cho giòn, lật mặt còn lại áp thêm 2 phút. Cho bơ và tỏi vào rưới đều lên mặt cá.',
        'Bước 4: Trộn salad với chút dầu giấm. Xếp cá hồi, khoai lang hấp và salad ra đĩa, vắt chút chanh lên cá.',
      ],
    },
    {
      name: 'Bún bò xào thanh đạm & Rau sống đa dạng',
      calories: 490,
      protein: 36,
      carbs: 62,
      fat: 9,
      fiber: 6,
      prepTime: '15 phút',
      difficulty: 'Dễ',
      tags: ['Đậm đà', 'Nhiều rau', 'Thanh mát'],
      whyGood: 'Bữa trưa tươi mát với lượng rau xanh dồi dào, thịt bò nạc xào nhanh giữ trọn vi chất kẽm và sắt.',
      ingredients: [
        '150g bún tươi trần ráo nước',
        '120g thịt thăn bò mềm thái lát mỏng',
        '1/2 củ hành tây thái mỏng, giá đỗ, xà lách, rau thơm',
        '1 thìa cà phê đậu phộng rang giã nhỏ',
        'Nước mắm chua ngọt pha nhạt (nước mắm, chanh, ớt, tỏi)',
      ],
      instructions: [
        'Bước 1: Ướp thịt bò với tỏi băm, chút tiêu và 1/2 thìa dầu hào trong 10 phút.',
        'Bước 2: Phi thơm tỏi với chút dầu, xào thịt bò và hành tây trên lửa lớn trong 2 phút cho vừa chín tới.',
        'Bước 3: Cho xà lách thái nhỏ, giá đỗ và rau thơm vào đáy tô, xếp bún tươi lên trên.',
        'Bước 4: Đặt thịt bò xào lên mặt tô bún, rắc đậu phộng rang và chan nước mắm chua ngọt trộn đều.',
      ],
    },
    {
      name: 'Canh chua cá lóc & Cơm trắng vừa bát, Tép rang',
      calories: 470,
      protein: 35,
      carbs: 58,
      fat: 8,
      fiber: 5,
      prepTime: '25 phút',
      difficulty: 'Trung bình',
      tags: ['Thuần Việt', 'Cơm nhà', 'Dễ ăn'],
      whyGood: 'Vị chua tự nhiên kích thích tiêu hóa, cá lóc thịt lành tính, ít calo và giàu đạm chất lượng cao.',
      ingredients: [
        '1 khúc cá lóc tươi (khoảng 150g)',
        '1 bát cơm trắng vừa (khoảng 130g)',
        'Cà chua, dứa (thơm), đậu bắp, bạc hà (dọc mùng), giá đỗ',
        'Me chua lọc lấy nước cốt, ngò gai, ngò om (rau ngổ)',
        'Gia vị: Nước mắm, ớt lát, muối',
      ],
      instructions: [
        'Bước 1: Đun sôi 400ml nước cùng nước cốt me, cho cá lóc vào nấu chín rồi vớt bọt cho nước trong.',
        'Bước 2: Cho dứa và cà chua vào nấu tiếp 3 phút, sau đó cho đậu bắp và bạc hà vào.',
        'Bước 3: Nêm 1 thìa nước mắm ngon và chút muối cho vừa vị chua ngọt thanh dịu, cuối cùng cho giá đỗ và rau ngổ vào tắt bếp.',
        'Bước 4: Múc canh ra bát lớn, ăn kèm cơm trắng nóng và bát nước mắm mặn giầm ớt.',
      ],
    },
  ],

  dinner: [
    {
      name: 'Canh thịt bằm nấu bí đao & Đậu phụ hấp sốt xì dầu',
      calories: 340,
      protein: 28,
      carbs: 26,
      fat: 11,
      fiber: 6,
      prepTime: '18 phút',
      difficulty: 'Dễ',
      tags: ['Thanh nhiệt', 'Nhẹ bụng', 'Ngủ ngon'],
      whyGood: 'Bí đao giàu nước và khoáng chất, ít calo, giúp cơ thể nhẹ nhõm không bị tức bụng trước giờ ngủ.',
      ingredients: [
        '100g thịt nạc thăn heo xay nhuyễn',
        '250g bí đao gọt vỏ, thái lát vừa ăn',
        '1 bìa đậu phụ trắng tươi (khoảng 120g)',
        'Hành hoa, ngò rí thái nhỏ, 1 nhánh hành tím băm',
        '1 thìa nước tương, 1/2 thìa dầu mè, tiêu xay, gia vị',
      ],
      instructions: [
        'Bước 1: Đậu phụ cắt miếng vuông vừa ăn, cho vào đĩa hấp nóng trong 5 phút. Rưới nước tương và chút dầu mè lên trên.',
        'Bước 2: Phi thơm hành tím, cho thịt bằm vào xào săn với chút gia vị.',
        'Bước 3: Đổ 400ml nước vào đun sôi, cho bí đao vào nấu trong 4-5 phút cho bí vừa chín trong.',
        'Bước 4: Nêm nếm lại vừa ăn, rắc hành ngò và tiêu. Bữa tối nhẹ nhàng với bát canh bí đao và đậu phụ nóng.',
      ],
    },
    {
      name: 'Tôm hấp nước dừa & Salad xà lách sốt sữa chua mè rang',
      calories: 310,
      protein: 34,
      carbs: 18,
      fat: 8,
      fiber: 5,
      prepTime: '15 phút',
      difficulty: 'Dễ',
      tags: ['Ít tinh bột', 'Protein cao', 'Chống tích mỡ'],
      whyGood: 'Tôm cung cấp lượng đạm nạc dồi dào mà hầu như không có chất béo bão hòa, lý tưởng cho bữa tối.',
      ingredients: [
        '160g tôm sú hoặc tôm thẻ tươi sống',
        '100ml nước dừa tươi ngọt tự nhiên',
        '1 cây sả đập dập, vài cọng hành hoa',
        '1 đĩa lớn xà lách giòn, dưa leo, cà chua bi',
        '2 thìa sữa chua không đường trộn cùng 1 thìa sốt mè rang làm sốt',
      ],
      instructions: [
        'Bước 1: Tôm rửa sạch, cắt bớt râu. Sả đập dập lót đáy nồi.',
        'Bước 2: Cho tôm vào nồi cùng nước dừa tươi, đậy vung đun sôi khoảng 4-5 phút cho tôm chuyển sang màu đỏ au là chín ngọt.',
        'Bước 3: Rửa sạch rau xà lách, cà chua bi và dưa chuột, bày ra đĩa lớn.',
        'Bước 4: Bóc vỏ tôm chấm muối tiêu chanh, ăn kèm đĩa salad trộn sốt sữa chua mè rang thanh mát.',
      ],
    },
    {
      name: 'Mực xào rau củ ngũ sắc & Nửa chén cơm gạo lứt',
      calories: 380,
      protein: 32,
      carbs: 42,
      fat: 6,
      fiber: 7,
      prepTime: '20 phút',
      difficulty: 'Dễ',
      tags: ['Đầy màu sắc', 'Giàu vi chất', 'Ít calo'],
      whyGood: 'Mực giòn ngọt, giàu kẽm và selen giúp tăng cường trao đổi chất mà năng lượng nạp vào cực kỳ tối ưu.',
      ingredients: [
        '150g mực ống tươi làm sạch, khía vảy rồng cắt khúc',
        '1/2 quả ớt chuông đỏ, 1/2 quả ớt chuông vàng, 50g hành tây',
        '50g cần tây và vài tai nấm hương ngâm nở',
        '1/2 bát con cơm gạo lứt (khoảng 80g)',
        '1 thìa cà phê dầu hạt cải, tỏi băm, tiêu, nước tương',
      ],
      instructions: [
        'Bước 1: Chần nhanh mực qua nước sôi có gừng trong 20 giây rồi vớt ra ngay cho mực giòn ráo.',
        'Bước 2: Phi thơm tỏi với chút dầu, cho ớt chuông, hành tây và nấm hương vào đảo nhanh trên lửa lớn.',
        'Bước 3: Trút mực vào đảo cùng rau củ trong 1-2 phút, nêm 1 thìa nước tương và tiêu vừa khẩu vị.',
        'Bước 4: Cho cần tây vào đảo đều rồi tắt bếp, dùng nóng cùng nửa chén cơm gạo lứt dẻo.',
      ],
    },
    {
      name: 'Thịt bò xào măng tây & Canh rau ngót nấu tôm',
      calories: 390,
      protein: 36,
      carbs: 22,
      fat: 14,
      fiber: 6,
      prepTime: '20 phút',
      difficulty: 'Dễ',
      tags: ['Giàu kali', 'Hỗ trợ giấc ngủ', 'Chất lượng cao'],
      whyGood: 'Măng tây chứa nhiều folate và chất chống oxy hóa, hỗ trợ bài tiết natri dư thừa giúp giảm tích nước.',
      ingredients: [
        '120g thịt thăn bò tươi thái mỏng',
        '150g măng tây non bẻ khúc giòn',
        '50g tôm khô hoặc tôm tươi băm nhỏ',
        '1 bó nhỏ rau ngót tuốt lá rửa sạch vò nhẹ',
        '1 thìa dầu ô liu, tỏi băm, nước mắm, tiêu',
      ],
      instructions: [
        'Bước 1: Ướp thịt bò với tỏi băm và chút tiêu xay trong 5 phút.',
        'Bước 2: Đun 350ml nước sôi với tôm, cho rau ngót vò vào nấu 3 phút, nêm chút nước mắm là xong bát canh ngọt mát.',
        'Bước 3: Phi thơm tỏi, xào măng tây trên lửa vừa khoảng 2 phút cho măng tây chín tới.',
        'Bước 4: Tăng lửa lớn, trút thịt bò vào đảo nhanh tay 1 phút rồi trút ra đĩa, rắc tiêu thơm.',
      ],
    },
  ],

  snack: [
    {
      name: 'Sữa chua Hy Lạp trộn hạt điều & Quả việt quất',
      calories: 180,
      protein: 15,
      carbs: 18,
      fat: 5,
      fiber: 3,
      prepTime: '3 phút',
      difficulty: 'Rất dễ',
      tags: ['Probiotic', 'Nhanh gọn', 'Tốt cho đường ruột'],
      whyGood: 'Cung cấp men vi sinh sống và lượng đạm dồi dào, giải tỏa cơn đói xế chiều tức thì.',
      ingredients: [
        '1 hộp sữa chua Hy Lạp không đường (120g)',
        '30g quả việt quất tươi (hoặc dâu tây cắt hạt lựu)',
        '10g hạt điều rang mộc không muối (khoảng 6-7 hạt giã nhẹ)',
        '1/2 thìa cà phê mật ong rừng nguyên chất',
      ],
      instructions: [
        'Bước 1: Múc sữa chua Hy Lạp vào cốc hoặc bát thủy tinh.',
        'Bước 2: Rải việt quất tươi và hạt điều giã dập lên mặt sữa chua.',
        'Bước 3: Rưới nhẹ một đường mật ong mỏng lên trên và thưởng thức ngay.',
      ],
    },
    {
      name: 'Trứng luộc lòng đào & 1 quả táo nhỏ',
      calories: 160,
      protein: 7,
      carbs: 20,
      fat: 5,
      fiber: 4,
      prepTime: '8 phút',
      difficulty: 'Rất dễ',
      tags: ['Tiện lợi', 'Dễ mang đi', 'No bền'],
      whyGood: 'Chất xơ pectin trong táo kết hợp với chất đạm và béo tốt của trứng giúp duy trì năng lượng bền bỉ.',
      ingredients: [
        '1 quả trứng gà ta',
        '1 quả táo xanh hoặc táo đỏ cỡ nhỏ (khoảng 120g)',
        'Một chút muối tiêu nhẹ chấm kèm',
      ],
      instructions: [
        'Bước 1: Cho trứng vào nồi nước lạnh, đun sôi rồi canh đúng 6 phút để có trứng lòng đào dẻo mịn.',
        'Bước 2: Vớt trứng ra ngâm ngay vào bát nước đá lạnh 2 phút rồi bóc vỏ.',
        'Bước 3: Táo rửa sạch dưới vòi nước, thái lát vừa ăn.',
        'Bước 4: Ăn trứng chấm muối tiêu nhẹ kèm các lát táo giòn ngọt thanh.',
      ],
    },
    {
      name: 'Sinh tố bơ chuối sữa hạnh nhân (Không đường)',
      calories: 210,
      protein: 6,
      carbs: 28,
      fat: 9,
      fiber: 5,
      prepTime: '5 phút',
      difficulty: 'Rất dễ',
      tags: ['Mịn màng', 'Ngon miệng', 'Vitamin E'],
      whyGood: 'Chất béo đơn không bão hòa từ bơ tốt cho làn da và tim mạch, vị ngọt tự nhiên từ chuối không làm tăng đường huyết đột ngột.',
      ingredients: [
        '50g bơ sáp chín (khoảng 1/3 quả bơ)',
        '1/2 quả chuối đông lạnh (để sinh tố sánh kem)',
        '150ml sữa hạnh nhân hoặc sữa hạt không đường',
        'Vài viên đá lạnh sạch',
      ],
      instructions: [
        'Bước 1: Cho bơ, chuối cắt khúc và sữa hạnh nhân vào cối máy xay sinh tố.',
        'Bước 2: Thêm vài viên đá nhỏ rồi bấm nút xay nhuyễn mịn trong 30-45 giây.',
        'Bước 3: Rót sinh tố ra ly cao, có thể rắc chút hạt chia lên mặt nếu thích.',
      ],
    },
  ],
};

// POST /api/ai/suggest-meals
// Takes { mealType, remainingCalories, goal, targetCalories }
// Returns personalized meal suggestions with full recipes & macros
router.post('/suggest-meals', async (req, res) => {
  try {
    const {
      mealType = 'lunch',
      remainingCalories = 600,
      goal = 'lose',
      targetCalories = 2000,
    } = req.body;

    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const selectedType = validMealTypes.includes(mealType) ? mealType : 'lunch';

    const apiKey = process.env.GEMINI_API_KEY;

    // IF GEMINI API KEY is configured, attempt to call real Gemini Flash AI
    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
      try {
        console.log(`[AI] Calling Google Gemini for mealType: ${selectedType}...`);
        const prompt = `Bạn là một chuyên gia dinh dưỡng và đầu bếp chuyên về ẩm thực Việt Nam lành mạnh (Healthy Vietnamese Food).
Người dùng có thông tin sau:
- Bữa ăn: ${selectedType === 'breakfast' ? 'Bữa sáng' : selectedType === 'lunch' ? 'Bữa trưa' : selectedType === 'dinner' ? 'Bữa tối' : 'Bữa phụ/xế'}
- Mục tiêu thể trạng: ${goal === 'lose' ? 'Giảm mỡ/Giảm cân' : goal === 'gain' ? 'Tăng cơ/Tăng cân' : 'Duy trì vóc dáng khỏe mạnh'}
- Số calo còn lại trong ngày: khoảng ${Math.max(200, Math.round(remainingCalories))} kcal.
- Mức calo tiêu chuẩn mỗi ngày: ${targetCalories} kcal.

Hãy gợi ý ĐÚNG 3 đến 4 món ăn thuần Việt phong phú, dễ nấu, phù hợp với số calo trên.
Trả về KẾT QUẢ DUY NHẤT LÀ MỘT ĐỐI TƯỢNG JSON (không có markdown backticks hoặc văn bản giải thích thừa), theo cấu trúc:
{
  "suggestions": [
    {
      "name": "Tên món ăn (tiếng Việt)",
      "calories": 420,
      "protein": 35,
      "carbs": 45,
      "fat": 8,
      "fiber": 6,
      "prepTime": "20 phút",
      "difficulty": "Dễ",
      "tags": ["Giàu đạm", "Ít tinh bột", "Thanh đạm"],
      "whyGood": "Giải thích ngắn 1-2 câu vì sao món này phù hợp mục tiêu...",
      "ingredients": [
        "150g ức gà tươi thái lát",
        "1 củ khoai lang nhỏ (120g)",
        "Gia vị: muối, tiêu, 1 thìa dầu ô liu"
      ],
      "instructions": [
        "Bước 1: Sơ chế và ướp...",
        "Bước 2: Nấu hoặc xào...",
        "Bước 3: Hoàn thành và trình bày..."
      ]
    }
  ]
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          // Strip any code block markdown ```json ... ```
          rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(rawText);
          if (parsed && Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
            return res.json({
              source: 'gemini-1.5-flash',
              mealType: selectedType,
              remainingCalories,
              suggestions: parsed.suggestions,
            });
          }
        } else {
          const errText = await geminiRes.text();
          console.warn('[AI] Gemini API error, falling back to curated AI engine:', errText);
        }
      } catch (geminiError) {
        console.warn('[AI] Error calling Gemini, falling back to curated engine:', geminiError.message);
      }
    }

    // FALLBACK: Built-in intelligent Vietnamese nutrition culinary engine
    // Customizes and shuffles appropriate recipes based on mealType and remaining calories
    const pool = CURATED_MEALS[selectedType] || CURATED_MEALS.lunch;

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());

    // Select up to 3-4 dishes
    const suggestions = shuffled.slice(0, 4).map((dish) => {
      // Adjust small whyGood tone based on user goal
      let tailoredWhyGood = dish.whyGood;
      if (goal === 'lose' && !dish.tags.includes('Giảm cân')) {
        tailoredWhyGood += ' Giúp thâm hụt calo tự nhiên mà không gây đói vặt.';
      } else if (goal === 'gain') {
        tailoredWhyGood += ' Cung cấp nguồn dưỡng chất lý tưởng để tái tạo cơ bắp.';
      }
      return {
        ...dish,
        whyGood: tailoredWhyGood,
      };
    });

    return res.json({
      source: 'offline-smart-ai',
      mealType: selectedType,
      remainingCalories,
      suggestions,
    });
  } catch (error) {
    console.error('Error generating meal suggestions:', error);
    return res.status(500).json({ error: 'Không thể tạo gợi ý món ăn lúc này' });
  }
});

module.exports = router;

