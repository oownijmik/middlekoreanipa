interface FrontEnvironment { // 앞에 뭐가 있는지
  type: null | 'middle' | 'final' // 각각 현재 자모음이 어두 / 모음 뒤 / 종성 뒤에 있음을 의미
  charCode?: number; // 앞에 있는 자모음의 charCode
}

interface BackEnvironment { // 뒤에 뭐가 있는지
  type: null | 'initial' | 'middle' // 각각 어말 / 초성 앞 / 중성 앞에 있음을 의미
  charCode?: number; // 뒤에 있는 자모음의 charCode
}

interface PronounceContext {
  frontEnvironment: FrontEnvironment;
  backEnvironment: BackEnvironment;
}

// https://namu.wiki/w/%EA%B5%AD%EC%A0%9C%EC%9D%8C%EC%84%B1%EA%B8%B0%ED%98%B8#rfn-29
const middleToPhoneticMap = {
  0x119e: '\u028C', // ㆍ : ʌ
  0x1173: '\u0268', // ㅡ : ɨ
  0x1175: '\u0069', // ᅵ : i
  0x1169: '\u006f', // ᅩ : o
  0x1161: '\u0061', // ᅡ : a CHECK: a 맞나? ɐ 아닌가?
  0x116e: '\u0075', // ᅮ : u
  0x1165: '\u0259', // ᅥ : ə CHECK: 1D4A도 있음
  0x116d: 'jo', // ᅭ : jo
  0x1163: 'ja', // ᅣ : ja
  0x1172: 'ju', // ᅲ : ju
  0x1167: 'jə', // ᅧ : jə
  0x11a1: 'ʌj', // ᆡ : ʌj
  0x1174: 'ɨj', // ᅴ : ɨj
  0x116c: 'oj', // ᅬ : oj
  0x1162: 'aj', // ᅢ : aj
  0x1171: 'uj', // ᅱ : uj
  0x1166: 'əj', // ᅦ : əj
  0x1188: 'joj', // ᆈ : joj
  0x1164: 'jaj', // ᅤ : jaj
  0x1194: 'juj', // ᆔ : juj
  0x1168: 'jəj', // ᅨ : jəj
  0x116b: 'waj', // ᅫ : waj
  0x1170: 'wəj', // ᅰ : wəj
  0x116a: 'wa', // ᅪ : wa
  0x116f: 'wə', // ᅯ : wə
}

// 초성이면 true 반환, 아니면 false 반환
function isInitialChar(charCode: number): boolean {
  return 0x1100 <= charCode && charCode <= 0x115e;
}

// 중성이면 true 반환, 아니면 false 반환
function isMiddleChar(charCode: number): boolean {
  return 0x1161 <= charCode && charCode <= 0x11a7;
}

// 종성이면 true 반환, 아니면 false 반환
function isFinalChar(charCode: number): boolean {
  return 0x11a8 <= charCode && charCode <= 0x11ff;
}

function charCodeToPhoneticSymbol(charCode: number, context: PronounceContext, backContextOfNextChar?: BackEnvironment) {
  console.log(`처리할 코드: ${charCode}` )
  console.log('context type: ', context);
  console.log('backContextOfNextChar: ', backContextOfNextChar);
  let phoneticSymbol = '?';
  switch (charCode) {
    case 0x1100: // 초성 ㄱ
      if (context.frontEnvironment.type === null) { // 어두
        phoneticSymbol = 'k';

      } else if (context.frontEnvironment.type === 'final') { // 종성 뒤
        if ([0x11ab, 0x11af, 0x11b7, 0x11bc, 0x11f0, 0x11B1].includes(context.frontEnvironment.charCode)) { // 받침 ㄴ, ㄹ, ㅁ, ㅇ, ㆁ(옛이응), ㄻ 뒤
          phoneticSymbol = 'g';
        } else { // 받침 ㄱ, ㄷ, ㅂ, ㅅ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㄹㆆ, ㅧ, ㄺ, ㄼ, ㄽ, ㅯ, ㅄ,  ㄱㅅ, ㄹㆆ, ㆁㅅ(옛이응+ㅅ) 등 그 외 자음 뒤
          phoneticSymbol = 'k*';
        }

      } else if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.type === 'middle') { // 모음 앞
          phoneticSymbol = 'g';
        }
      }
      break;
    case 0x11a8: // 종성 ㄱ
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.charCode === 0x110b) { // ㅇ앞
          phoneticSymbol = 'g';
        } else if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 'k˺';
        } else if ([0x1102, 0x1105, 0x1106].includes(context.backEnvironment.charCode)) { // 초성 ㄴ, ㄹ, ㅁ 앞
          phoneticSymbol = 'ŋ';
        } else if ([0x1112, 0x1158].includes(context.backEnvironment.charCode)) { // 초성 ㅎ, ㆅ 앞
          phoneticSymbol = 'k';
        } else {
          phoneticSymbol = 'k˺';
        }
      }
      break;

    case 0x1102: // 초성 ㄴ
      phoneticSymbol = 'n';
      break;
    
    case 0x11ab: // 종성 ㄴ
      phoneticSymbol = 'n';
      break;

    case 0x1103: // 초성 ㄷ
      if (context.frontEnvironment.type === null) { // 어두
        phoneticSymbol = 't';
      } else if (context.frontEnvironment.type === 'final') { // 종성 뒤
        if ([0x11ab, 0x11af, 0x11b7, 0x11bc, 0x11f0, 0x11b1].includes(context.frontEnvironment.charCode)) { // 종성 ㄴ, ㄹ, ㅁ, ㅇ, ㆁ(옛이응), ㄻ 뒤
          phoneticSymbol = 'd';
        } else { // 받침 ㄱ, ㄷ, ㅂ, ㅅ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㄹㆆ, ㅧ, ㄺ, ㄼ, ㄽ, ㅯ, ㅄ,  ㄱㅅ, ㄹㆆ, ㆁㅅ(옛이응+ㅅ) 등 그 외 자음 뒤
          phoneticSymbol = 't*';
        }
      } else if (context.frontEnvironment.type === 'middle') {
        if (context.backEnvironment.type === 'middle') { // 모음 앞
          phoneticSymbol = 'd';
        }
      }
      break;

    case 0x11ae: // 종성 ㄷ
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.charCode === 0x110b) { // 초성 ㅇ 앞
          phoneticSymbol = 'd';
        } else if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 't˺';
        } else if ([0x1102, 0x1105, 0x1106].includes(context.backEnvironment.charCode)) { // 초성 ㄴ, ㄹ, ㅁ 앞
          phoneticSymbol = 'n';
        } else if (context.backEnvironment.charCode === 0x1112) { // 초성 ㅎ 앞
          phoneticSymbol = 't';
        } else {
          phoneticSymbol = 't˺';
        }
      }
      break;
    
    case 0x1105: // 초성 ㄹ
      if (context.frontEnvironment.type === null) { // 어두
        phoneticSymbol = 'n';

      } else if (context.frontEnvironment.type === 'final') { // 종성 뒤 
        if (context.frontEnvironment.charCode === 0x11AB) { // 받침 ㄴ 뒤
          phoneticSymbol = 'ɾ';
        } else if (context.frontEnvironment.charCode === 0x11AF) { // 받침 ㄹ 뒤
          phoneticSymbol = 'l';
        } else { // 받침 ㄱ, ㄷ, ㅁ, ㅂ, ㅅ, ㅇ, ㆁ(옛이응), ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㄹㆆ, ㅧ, ㄺ, ㄻ, ㄼ, ㄽ, ㅯ, ㅄ,  ㄱㅅ, ㄹㆆ 등 그 외 자음 뒤
          phoneticSymbol = 'n';
        }

      } else if (context.frontEnvironment.type === 'middle') { // 모음(중성) 뒤
        if (context.backEnvironment.type === 'middle') { // 모음 앞
          phoneticSymbol = 'ɾ';
        }
      }
      break;
    
    case 0x11AF: // 종성 ㄹ
      if (context.frontEnvironment.type === 'middle') { // 모음(중성) 뒤
        if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 'ɾ';
        } else if (context.backEnvironment.charCode === 0x1105) { // 초성 ㄹ 앞
          phoneticSymbol = 'l';
        } else { // 그 외 앞
          phoneticSymbol = 'ɾ';
        }
      }
      break;

    case 0x1106: // 초성 ㅁ
      phoneticSymbol = 'm';
      break;
    
    case 0x11B7: // 종성 ㅁ
      phoneticSymbol = 'm';
      break;

    case 0x1107: // 초성 ㅂ
      if (context.frontEnvironment.type === null) { // 어두
        phoneticSymbol = 'p';

      } else if (context.frontEnvironment.type === 'final') { // 종성 뒤
        if ([0x11AB, 0x11AF, 0x11B7, 0x11BC, 0x11F0, 0x11B1].includes(context.frontEnvironment.charCode)) { // 받침 ㄴ, ㄹ, ㅁ, ㅇ, ㆁ(옛이응), ㄻ 뒤
          phoneticSymbol = 'b';
        } else { // 받침 ㄱ, ㄷ, ㅂ, ㅅ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㄹㆆ, ㅧ, ㄺ, ㄼ, ㄽ, ㅯ, ㅄ,  ㄱㅅ, ㄹㆆ, ㆁㅅ(옛이응+ㅅ) 등 그 외 자음 뒤
          phoneticSymbol = 'p*';
        }

      } else if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.type === 'middle') { // 모음 앞
          phoneticSymbol = 'b';
        }
      }
      break;
    
    case 0x11B8: // 종성 ㅂ
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.charCode === 0x110B) { // 초성 ㅇ 앞
          phoneticSymbol = 'b';
        } else if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 'p˺';
        } else if ([0x1102, 0x1105, 0x1106].includes(context.backEnvironment.charCode)) { // 초성 ㄴ, ㄹ, ㅁ 앞
          phoneticSymbol = 'm';
        } else if (context.backEnvironment.charCode === 0x1112) { // ㅎ 앞
          phoneticSymbol = 'p';
        } else { // 그 외 앞
          phoneticSymbol = 'p˺';
        }
      }
      break;
    
    case 0x1109: // 초성 ㅅ
      if (context.frontEnvironment.type === null) { // 어두(어절의 시작)
        if ([0x1175, 0x116D, 0x1163, 0x1172, 0x1167, 0x1188, 0x1164, 0x1194, 0x1168].includes(context.backEnvironment.charCode)) { // ㅣ, ㅛ, ㅑ, ㅠ, ㅕ, ㆉ, ㅒ, ㆌ, ㅖ 앞
          phoneticSymbol = 'ʃ';
          // ㆍ, ㅡ , ㅗ, ㅏ, ㅜ, ㅓ, ㆎ, ㅢ, ㅚ, ㅐ, ㅟ, ㅔ, ㅙ, ㅞ, ㅘ, ㅝ 앞
        } else if ([0x119E, 0x1173, 0x1169, 0x1161, 0x116E, 0x1165, 0x11A1, 0x1174, 0x116C, 0x1162, 0x1171, 0x1166, 0x116B, 0x1170, 0x116A, 0x116F].includes(context.backEnvironment.charCode)) { 
          phoneticSymbol = 's';
        }

      } else if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if ([0x1175, 0x116D, 0x1163, 0x1172, 0x1167, 0x1188, 0x1164, 0x1194, 0x1168].includes(context.backEnvironment.charCode)) { // ㅣ, ㅛ, ㅑ, ㅠ, ㅕ, ㆉ, ㅒ, ㆌ, ㅖ 앞
          phoneticSymbol = 'ʃ';
          // ㆍ, ㅡ , ㅗ, ㅏ,  ㅜ, ㅓ, ㆎ, ㅢ, ㅚ, ㅐ, ㅟ, ㅔ, ㅙ, ㅞ, ㅘ, ㅝ 앞
        } else if ([0x119E, 0x1173, 0x1169, 0x1161, 0x116E, 0x1165, 0x11A1, 0x1174, 0x116C, 0x1162, 0x1171, 0x1166, 0x116B, 0x1170, 0x116A, 0x116F].includes(context.backEnvironment.charCode)) { 
          phoneticSymbol = 's';
        }

      } else if (context.frontEnvironment.type === 'final') { // 받침 뒤
        if ([0x11AB, 0x11AF, 0x11B7, 0x11BC, 0x11F0, 0x11B1].includes(context.frontEnvironment.charCode)) { // 받침 ㄴ, ㄹ, ㅁ, ㅇ, ㆁ(옛이응), ㄻ 뒤
          if ([0x1175, 0x116D, 0x1163, 0x1172, 0x1167, 0x1188, 0x1164, 0x1194, 0x1168].includes(context.backEnvironment.charCode)) { // ㅣ, ㅛ, ㅑ, ㅠ, ㅕ, ㆉ, ㅒ, ㆌ, ㅖ 앞
            phoneticSymbol = 'ʃ';
            // ㆍ, ㅡ , ㅗ, ㅏ, ㅜ, ㅓ, ㆎ, ㅢ, ㅚ, ㅐ, ㅟ, ㅔ, ㅙ, ㅞ, ㅘ, ㅝ 앞
          } else if ([0x119E, 0x1173, 0x1169, 0x1161, 0x116E, 0x1165, 0x11A1, 0x1174, 0x116C, 0x1162, 0x1171, 0x1166, 0x116B, 0x1170, 0x116A, 0x116F].includes(context.backEnvironment.charCode)) { 
            phoneticSymbol = 's';
          }

        } else { // 받침 ㄱ, ㄷ, ㅂ, ㅅ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㄹㆆ, ㅧ, ㅦ, ㄺ, ㄼ, ㄽ, ㅯ, ㅄ,  ㄱㅅ, ㄹㆆ, ㆁㅅ(옛이응+ㅅ) 등 그 외 자음 뒤
          if ([0x1175, 0x116D, 0x1163, 0x1172, 0x1167, 0x1188, 0x1164, 0x1194, 0x1168].includes(context.backEnvironment.charCode)) { // ㅣ, ㅛ, ㅑ, ㅠ, ㅕ, ㆉ, ㅒ, ㆌ, ㅖ 앞
            phoneticSymbol = 'ʃ*';
            // ㆍ, ㅡ , ㅗ, ㅏ, ㅜ, ㅓ, ㆎ, ㅢ, ㅚ, ㅐ, ㅟ, ㅔ, ㅙ, ㅞ, ㅘ, ㅝ 앞
          } else if ([0x119E, 0x1173, 0x1169, 0x1161, 0x116E, 0x1165, 0x11A1, 0x1174, 0x116C, 0x1162, 0x1171, 0x1166, 0x116B, 0x1170, 0x116A, 0x116F].includes(context.backEnvironment.charCode)) { 
            phoneticSymbol = 's*';
          }

        }
      }
      break;

    case 0x11BA: // 종성 ㅅ
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.charCode === 0x110B && backContextOfNextChar) { // 뒤에 ㅇ이 있고 그 뒤에 모음이 있을 때
          if ([0x1175, 0x116D, 0x1163, 0x1172, 0x1167, 0x1188, 0x1164, 0x1194, 0x1168].includes(backContextOfNextChar.charCode)) { // 이, 요, 야, 유, 여, , 얘, , 예 앞
            phoneticSymbol = 'ʃ';            
          } else if ([0x119E, 0x1173, 0x1169, 0x1161, 0x116E, 0x1165, 0x11A1, 0x1174, 0x116C, 0x1162, 0x1171, 0x1166, 0x116B, 0x1170, 0x116A, 0x116F].includes(backContextOfNextChar.charCode)) { // , 으, 오, 아, 우, 어, , 의, 외, 애, 위, 에, 왜, 웨, 와, 워 앞
            phoneticSymbol = 's';
          }
        } else if (context.backEnvironment.type === null) { // 어말(어절의 끝)
          phoneticSymbol = 't˺';
        } else if ([0x1102, 0x1105, 0x1106].includes(context.backEnvironment.charCode)) { // ㄴ, ㄹ, ㅁ 앞
          phoneticSymbol = 'n';
        } else if (context.backEnvironment.charCode === 0x1112) { // ㅎ 앞
          phoneticSymbol = 't';
        } else if ([0x112B, 1140].includes(context.backEnvironment.charCode)) { // ㅸ, ㅿ 앞
          phoneticSymbol = 'z';
        } else { // ㄱ, ㄷ, ㅂ, ㅅ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅳ, ㅄ, ㅺ, ㅼ, ㅽ 등 그 외 앞
          phoneticSymbol = 't˺';
        } 
      }
      break;

    case 0x110B: // 초성 ㅇ
      if (context.frontEnvironment.type === null) { // 어두
        phoneticSymbol = ''; // 탈락
      } else if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.type === 'middle') { // 모음 앞
          phoneticSymbol = ''; // 탈락
        }
      } else if (context.frontEnvironment.type === 'final') { // 받침 자음 뒤
        phoneticSymbol = '';
      }
      break;
    case 0x11BC: // 종성 ㅇ
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 'ŋ';
        } else if (context.backEnvironment.type === 'initial') {
          phoneticSymbol = 'ŋ';
        }
      }
      break;

    case 0x114C: // 초성 ㆁ(옛이응)
      phoneticSymbol = 'ŋ';
      break;
    case 0x11F0: // 종성 ㆁ(옛이응)
      phoneticSymbol = 'ŋ';
      break;

    case 0x110C: // 초성 ㅈ
      if (context.frontEnvironment.type === null) { // 어두
        if ([0x1175, 0x116D, 0x1163, 0x1172, 0x1167, 0x1188, 0x1164, 0x1194, 0x1168].includes(context.backEnvironment.charCode)) { // ㅣ, ㅛ, ㅑ, ㅠ, ㅕ, ㆉ, ㅒ, ㆌ, ㅖ 앞
          phoneticSymbol = 'tʃ';
          // ㆍ, ㅡ , ㅗ, ㅏ, ㅜ, ㅓ, ㆎ, ㅢ, ㅚ, ㅐ, ㅟ, ㅔ, ㅙ, ㅞ, ㅘ, ㅝ 앞
        } else if ([0x119E, 0x1173, 0x1169, 0x1161, 0x116E, 0x1165, 0x11A1, 0x1174, 0x116C, 0x1162, 0x1171, 0x1166, 0x116B, 0x1170, 0x116A, 0x116F].includes(context.backEnvironment.charCode)) { 
          phoneticSymbol = 'ts';
        }

      } else if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if ([0x1175, 0x116D, 0x1163, 0x1172, 0x1167, 0x1188, 0x1164, 0x1194, 0x1168].includes(context.backEnvironment.charCode)) { // ㅣ, ㅛ, ㅑ, ㅠ, ㅕ, ㆉ, ㅒ, ㆌ, ㅖ 앞
          phoneticSymbol = 'dʒ';
          // ㆍ, ㅡ , ㅗ, ㅏ, ㅜ, ㅓ, ㆎ, ㅢ, ㅚ, ㅐ, ㅟ, ㅔ, ㅙ, ㅞ, ㅘ, ㅝ 앞
        } else if ([0x119E, 0x1173, 0x1169, 0x1161, 0x116E, 0x1165, 0x11A1, 0x1174, 0x116C, 0x1162, 0x1171, 0x1166, 0x116B, 0x1170, 0x116A, 0x116F].includes(context.backEnvironment.charCode)) { 
          phoneticSymbol = 'dz';
        }

      } else if (context.frontEnvironment.type === 'final') {
        if ([0x11ab, 0x11af, 0x11b7, 0x11bc, 0x11f0].includes(context.frontEnvironment.charCode)) { // 받침 ㄴ, ㄹ, ㅁ, ㅇ, ㆁ(옛이응), ㄻ 뒤
          if ([0x1175, 0x116D, 0x1163, 0x1172, 0x1167, 0x1188, 0x1164, 0x1194, 0x1168].includes(context.backEnvironment.charCode)) { // ㅣ, ㅛ, ㅑ, ㅠ, ㅕ, ㆉ, ㅒ, ㆌ, ㅖ 앞
            phoneticSymbol = 'dʒ';
            // ㆍ, ㅡ , ㅗ, ㅏ, ㅜ, ㅓ, ㆎ, ㅢ, ㅚ, ㅐ, ㅟ, ㅔ, ㅙ, ㅞ, ㅘ, ㅝ 앞
          } else if ([0x119E, 0x1173, 0x1169, 0x1161, 0x116E, 0x1165, 0x11A1, 0x1174, 0x116C, 0x1162, 0x1171, 0x1166, 0x116B, 0x1170, 0x116A, 0x116F].includes(context.backEnvironment.charCode)) { 
            phoneticSymbol = 'dz';
          }

        } else { // 받침 ㄱ, ㄷ, ㅂ, ㅅ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㄹㆆ, ㅧ, ㅦ, ㄺ, ㄼ, ㄽ, ㅯ, ㅄ,  ㄱㅅ, ㄹㆆ 등 그 외 자음 뒤
          if ([0x1175, 0x116D, 0x1163, 0x1172, 0x1167, 0x1188, 0x1164, 0x1194, 0x1168].includes(context.backEnvironment.charCode)) { // ㅣ, ㅛ, ㅑ, ㅠ, ㅕ, ㆉ, ㅒ, ㆌ, ㅖ 앞
            phoneticSymbol = 'tʃ*';
            // ㆍ, ㅡ , ㅗ, ㅏ, ㅜ, ㅓ, ㆎ, ㅢ, ㅚ, ㅐ, ㅟ, ㅔ, ㅙ, ㅞ, ㅘ, ㅝ 앞
          } else if ([0x119E, 0x1173, 0x1169, 0x1161, 0x116E, 0x1165, 0x11A1, 0x1174, 0x116C, 0x1162, 0x1171, 0x1166, 0x116B, 0x1170, 0x116A, 0x116F].includes(context.backEnvironment.charCode)) { 
            phoneticSymbol = 'ts*';
          }
        }
      }
      break;
    case 0x11BD: // 종성 ㅈ
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.charCode === 0x110b) { // 초성 ㅇ 앞
          phoneticSymbol = 'd';
        } else if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 't˺';
        } else if ([0x1102, 0x1105, 0x1106].includes(context.backEnvironment.charCode)) { // 초성 ㄴ, ㄹ, ㅁ 앞
          phoneticSymbol = 'n';
        } else { // ㄱ, ㄷ, ㅂ, ㅅ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅳ, ㅄ, ㅺ, ㅼ, ㅽ 등 그 외 앞
          phoneticSymbol = 't˺';
        }
      }
      break;

    case 0x110e: // 초성 ㅊ
      if (context.frontEnvironment.type === null) { // 어두
        if ([0x1175, 0x116D, 0x1163, 0x1172, 0x1167, 0x1188, 0x1164, 0x1194, 0x1168].includes(context.backEnvironment.charCode)) { // ㅣ, ㅛ, ㅑ, ㅠ, ㅕ, ㆉ, ㅒ, ㆌ, ㅖ 앞
          phoneticSymbol = 'tʃʰ';
          // ㆍ, ㅡ , ㅗ, ㅏ, ㅜ, ㅓ, ㆎ, ㅢ, ㅚ, ㅐ, ㅟ, ㅔ, ㅙ, ㅞ, ㅘ, ㅝ 앞
        } else if ([0x119E, 0x1173, 0x1169, 0x1161, 0x116E, 0x1165, 0x11A1, 0x1174, 0x116C, 0x1162, 0x1171, 0x1166, 0x116B, 0x1170, 0x116A, 0x116F].includes(context.backEnvironment.charCode)) { 
          phoneticSymbol = 'tsʰ';
        }

      } else { // 아무거나 뒤
        if ([0x1175, 0x116D, 0x1163, 0x1172, 0x1167, 0x1188, 0x1164, 0x1194, 0x1168].includes(context.backEnvironment.charCode)) { // ㅣ, ㅛ, ㅑ, ㅠ, ㅕ, ㆉ, ㅒ, ㆌ, ㅖ 앞
          phoneticSymbol = 'tʃʰ';
          // ㆍ, ㅡ , ㅗ, ㅏ, ㅜ, ㅓ, ㆎ, ㅢ, ㅚ, ㅐ, ㅟ, ㅔ, ㅙ, ㅞ, ㅘ, ㅝ 앞
        } else if ([0x119E, 0x1173, 0x1169, 0x1161, 0x116E, 0x1165, 0x11A1, 0x1174, 0x116C, 0x1162, 0x1171, 0x1166, 0x116B, 0x1170, 0x116A, 0x116F].includes(context.backEnvironment.charCode)) { 
          phoneticSymbol = 'tsʰ';
        }
      }
      break;
    case 0x11BE: // 종성 
      if (context.frontEnvironment.type !== null) { // 아무거나 뒤
        if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 't˺';
        } else if ([0x1102, 0x1105, 0x1106].includes(context.backEnvironment.charCode)) { // 초성 ㄴ, ㄹ, ㅁ 앞
          phoneticSymbol = 'n';
        } else { // ㄱ, ㄷ, ㅂ, ㅅ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㄼ, ㄽ, ㅳ, ㅄ, ㅺ, ㅼ, ㅽ 등 그 외 앞
          phoneticSymbol = 't˺';
        }
      }
      break;

    case 0x110F: // 초성 ㅋ
      phoneticSymbol = 'kʰ';
      break;
    case 0x11BF: // 종성 ㅋ
      phoneticSymbol = 'kʰ';
      break;
    
    case 0x1110: // 초성 ㅌ
      if (context.frontEnvironment.type === null) { // 어두
        phoneticSymbol = 'tʰ';
      } else if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.type === 'middle') { // 모음 앞
          phoneticSymbol = 'tʰ';
        }
      } else { // 모든 자음 뒤
        phoneticSymbol = 'tʰ';
      }
      break;
    case 0x11C0: // 종성 ㅌ
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 't˺';
        } else if ([0x1102, 0x1105, 0x1106].includes(context.backEnvironment.charCode)) { // 초성 ㄴ, ㄹ, ㅁ 앞
          phoneticSymbol = 'n';
        } else { // ㄱ, ㄷ, ㅂ, ㅅ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㄽ, ㅳ, ㅄ, ㅺ, ㅼ, ㅽ 등 그 외 앞
          phoneticSymbol = 't˺';
        }
      }
      break;

    case 0x1111: // 초성 ㅍ
      if (context.frontEnvironment.type === null) { // 어두
        phoneticSymbol = 'pʰ';
      } else if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.type === 'middle') { // 모음 앞
          phoneticSymbol = 'pʰ';
        }
      } else { // 모든 자음 뒤
        phoneticSymbol = 'pʰ';
      }
      break;
    case 0x11C1: // 종성 ㅍ
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 'p˺';
        } else if ([0x1102, 0x1105, 0x1106].includes(context.backEnvironment.charCode)) { // 초성 ㄴ, ㄹ, ㅁ 앞
          phoneticSymbol = 'm';
        } else { // ㄱ, ㄷ, ㅂ, ㅅ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅳ, ㅄ, ㅺ, ㅼ, ㅽ 등 그 외 앞
          phoneticSymbol = 'p˺';
        }
      }
      break;

    case 0x1112: // 초성 ㅎ
      if (context.frontEnvironment.type === null) { // 어두
        if ([0x119E, 0x1161, 0x1165, 0x11A1, 0x1162, 0x1166].includes(context.backEnvironment.charCode)) { // ㆍ, ㅏ, ㅓ, ㆎ, ㅐ, ㅔ 앞
          phoneticSymbol = 'h';
        } else if ([0x1175, 0x116D, 0x1163, 0x1172, 0x1167, 0x1188, 0x1164, 0x1194, 0x1168].includes(context.backEnvironment.charCode)) { // l, ㅛ, ㅑ, ㅠ, ㅕ, ㆉ, ㅒ, ㆌ, ㅖ 앞
          phoneticSymbol = 'ç';
        } else if ([0x1173, 0x1174].includes(context.backEnvironment.charCode)) { // ㅡ, ㅢ 앞
          phoneticSymbol = 'x';
        } else if ([0x1169, 0x116E, 0x116C, 0x1171, 0x116B, 0x1170, 0x116A, 0x116F].includes(context.backEnvironment.charCode)) { // ㅗ, ㅜ, ㅚ, ㅟ, ㅙ, ㅞ, ㅘ, ㅝ 앞
          phoneticSymbol = 'ɸʷ';
        }
      } else if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        phoneticSymbol = 'ɦ';
      } else if (context.frontEnvironment.type === 'final') { // 받침 뒤
        if ([0x11A8, 0x11AE, 0x11B8, 0x11BA, 0x11B0, 0x11B2].includes(context.frontEnvironment.charCode)) { // 받침 ㄱ, ㄷ, ㅂ, ㅅ, ㄺ, ㄼ, 뒤
          phoneticSymbol = 'ʰ';
        } else if  ([0x11AB, 0x11AF, 0x11B7, 0x11BC, 0x11F0, 0x11D9].includes(context.frontEnvironment.charCode)) { // ㄴ, ㄹ, ㅁ, ㅇ, ㆁ(옛이응) ㄹㆆ 뒤
          phoneticSymbol = 'ɦ';
        }
      }
      break;
    case 0x11C2: // 종성 ㅎ
    // TODO ㅎ이 받침에 오는 경우는?
      break;

    case 0x1140: // 초성 ㅿ
      if (context.frontEnvironment.type === null) { // 어두
        phoneticSymbol = 'z';
      } else if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.type === 'middle') { // 모음 앞
          phoneticSymbol = 'z';
        }
      } else { // 받침 자음 뒤
        phoneticSymbol = 'z';
      }
      break;
    case 0x11EB: // 종성 ㅿ
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 't˺';
        } else if (context.backEnvironment.charCode === 0x1102) { // 초성 ㄴ 앞
          phoneticSymbol = 'n;'
        } else if (context.backEnvironment.charCode === 0x110B) { // 초성 ㅇ 앞
          phoneticSymbol = 'z';
        } else if (context.backEnvironment.charCode === 0x112B) { // 초성 ᄫ 앞
          phoneticSymbol = 'z';
        }
      }
      break;

    case 0x112B: // 초성 ᄫ, 받침에 오는 경우 없음
      phoneticSymbol = 'β';
      break;

    case 0x1101: // 초성 ㄲ, 받침에 오는 경우 없음
      phoneticSymbol = 'k*';
      break;

    case 0x1114: // 초성 ᄔ, TODO: 받침 없는지 확인
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        phoneticSymbol = 'nn';
      } else if (context.frontEnvironment.charCode === 0x11AF) { // 받침 ㄹ 뒤
        phoneticSymbol = 'n';
      }
      break;

    case 0x1104: // 초성 ㄸ, 받침에 오는 경우 없음
      phoneticSymbol = 't*';
      break;
    
    case 0x1108: // 초성 ㅃ, 받침 X
      phoneticSymbol = 'p*';
      break;

    case 0x110A: // 초성 ㅆ
      if (context.frontEnvironment.type === null) { // 어두
        phoneticSymbol = 's*';
      } else if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.type === 'middle') { // 모음 앞
          phoneticSymbol = 's*';
        } 
      } else { // 받침 자음 뒤
        phoneticSymbol = 's*';
      }
      break;
    case 0x11BB: // 종성 ㅆ
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.charCode === 0x1102) { // 초성 ㄴ 앞
          phoneticSymbol = 'n';
        } else if (context.backEnvironment.charCode === 0x1103) { // 초성 ㄷ 앞
          phoneticSymbol = 't˺';
        }
      }
      break;

    case 0x1147: // 초성 ㆀ, 받침 x
      phoneticSymbol = ''; // 탈락
      break;

    case 0x110D: // 초성 ㅉ
      if (context.frontEnvironment.type === null) {
        if ([0x1175, 0x116D, 0x1163, 0x1172, 0x1167, 0x1188, 0x1164, 0x1194, 0x1168].includes(context.backEnvironment.charCode)) { // ㅣ, ㅛ, ㅑ, ㅠ, ㅕ, ㆉ, ㅒ, ㆌ, ㅖ 앞
          phoneticSymbol = 'tʃ*';
          // ㆍ, ㅡ , ㅗ, ㅏ, ㅜ, ㅓ, ㆎ, ㅢ, ㅚ, ㅐ, ㅟ, ㅔ, ㅙ, ㅞ, ㅘ, ㅝ 앞
        } else if ([0x119E, 0x1173, 0x1169, 0x1161, 0x116E, 0x1165, 0x11A1, 0x1174, 0x116C, 0x1162, 0x1171, 0x1166, 0x116B, 0x1170, 0x116A, 0x116F].includes(context.backEnvironment.charCode)) { 
          phoneticSymbol = 'ts*';
        }
      } else { // 아무거나 뒤
        if ([0x1175, 0x116D, 0x1163, 0x1172, 0x1167, 0x1188, 0x1164, 0x1194, 0x1168].includes(context.backEnvironment.charCode)) { // ㅣ, ㅛ, ㅑ, ㅠ, ㅕ, ㆉ, ㅒ, ㆌ, ㅖ 앞
          phoneticSymbol = 'tʃ*';
          // ㆍ, ㅡ , ㅗ, ㅏ, ㅜ, ㅓ, ㆎ, ㅢ, ㅚ, ㅐ, ㅟ, ㅔ, ㅙ, ㅞ, ㅘ, ㅝ 앞
        } else if ([0x119E, 0x1173, 0x1169, 0x1161, 0x116E, 0x1165, 0x11A1, 0x1174, 0x116C, 0x1162, 0x1171, 0x1166, 0x116B, 0x1170, 0x116A, 0x116F].includes(context.backEnvironment.charCode)) { 
          phoneticSymbol = 'ts*';
        }
      }
      break;

    case 0x1158: // 초성 ㆅ, 받침 x
      phoneticSymbol = 'x';
      break;
    
    case 0x112D: // 초성 ㅺ, 받침 x
      phoneticSymbol = 'k*';
      break;
    
    case 0x112F: // 초성 ㅼ, 받침 x
      phoneticSymbol = 't*';
      break;

    case 0x1132: // 초성 ㅽ, 받침 x
      phoneticSymbol = 'p*';
      break;
    
    case 0x1120: // ㅳ, 받침 x
      if ([0x11A8, 0x11AE, 0x11B8, 0x11BA, 0x11D9].includes(context.frontEnvironment.charCode)) { // 받침 ㄱ, ㄷ, ㅂ, ㅅ ㄹㆆ뒤
        phoneticSymbol = 'p*t';
      } else { // 나머지 모든 환경(받침에 오는 경우 없음)
        phoneticSymbol = 'pt';
      }
      break;
    
    case 0x1121: // 초성 ㅄ
      if (context.frontEnvironment.type === null) { // 어두
        phoneticSymbol = 'ps';
      } else if ([0x11ab, 0x11af, 0x11b7, 0x11bc, 0x11f0].includes(context.frontEnvironment.charCode)) { // 받침 ㄴ, ㄹ, ㅁ, ㅇ, ㆁ(옛이응) 뒤
        phoneticSymbol = 'ps';
      } else if ([0x11A8, 0x11AE, 0x11B3, 0x11B8, 0x11BA, 0x11D9].includes(context.frontEnvironment.charCode)) { // 받침 ㄱ, ㄷ, ㄽ, ㅂ, ㅅ ㄹㆆ뒤
        phoneticSymbol = 'p*s';
      } else if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if (context.backEnvironment.type === 'middle') { // 모음 앞
          phoneticSymbol = 'ps';
        }
      }
      break;

    case 0x11B9: // 종성 ㅄ
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤
        if ([0x1100, 0x1109].includes(context.backEnvironment.charCode)) { // 초성 ㄱ, ㅅ 앞
          phoneticSymbol = 'p˺';
        } else if (context.backEnvironment.charCode === 0x110B) { // 초성 ㅇ 앞
          phoneticSymbol = 'b';
        } else if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 'p˺';
        }
      }
      break;
    
    case 0x1127: // 초성 ㅶ
      if (context.frontEnvironment.type === null) { // 어두
        phoneticSymbol = 'pts';
      } else if ([0x11A8, 0x11AE, 0x11B8, 0x11B2, 0x11BA, 0x11D9].includes(context.frontEnvironment.charCode)) { // 받침 ㄱ, ㄷ, ㅂ, ㄼ, ㅅ, ㄹㆆ뒤
        phoneticSymbol = 'p*ts'; // 그 외 자음 뒤
      } else if ([].includes(context.frontEnvironment.charCode)) { // 받침 ㄴ, ㄹ, ㅇ, ㆁ(옛이응) 뒤
        if (context.backEnvironment.charCode === 0x1175) { // ㅣ 앞
          phoneticSymbol = 'ptʃ';
        } else { // 그 외 모음 앞
          phoneticSymbol = 'pts';
        }
      }
      break;

    case 0x1129: // 초성 ㅷ
      if (context.frontEnvironment.charCode === 0x11A8) { // 받침 ㄱ 뒤
        phoneticSymbol = 'p*tʰ';
      } else { // 나머지 모든 환경
        phoneticSymbol = 'ptʰ'
      }
      break;

    case 0x1122: // 초성 ㅴ
      if (context.frontEnvironment.charCode === 0x11BA) { // 받침 ㅅ 뒤
        phoneticSymbol = 'p*k*';
      } else { // 나머지 모든 환경
        phoneticSymbol = 'pk*'
      }
      break;
      
    case 0x1123: // 초성 ㅵ
      phoneticSymbol = 'pt*';
      break;

    case 0x11B0: // 종성 ㄺ
      if (context.frontEnvironment.type === 'middle') {
        if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 'ɾk˺';
        } else if ([0x1100, 0x1103, 0x1107, 0x1109, 0x110C, 0x110F, 0x1110, 0x1132].includes(context.backEnvironment.charCode)) { // 초성 ㄱ, ㄷ, ㅂ, ㅅ, ㅈ, ㅋ, ㅌ, ㅽ 앞
          phoneticSymbol = 'ɾk˺';
        } else if ([0x1102, 0x1106].includes(context.backEnvironment.charCode)) { // 초성 ㄴ, ㅁ 앞
          phoneticSymbol = 'ɾŋ';
        } else if (context.backEnvironment.charCode === 0x110B) { // 초성 ㅇ 앞
          phoneticSymbol = 'ɾg'
        } else if (context.backEnvironment.charCode === 0x1112) { // 초성 ㅎ 앞
          phoneticSymbol = 'ɾk';
        }
      }
      break;

    case 0x11B1: // 종성 ㄻ
      phoneticSymbol = 'ɾm';
      break;

    case 0x11B2: // 종성 ㄼ
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤(받침에만 쓰임)
        if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 'ɾp˺';
        } else if ([0x1100, 0x1103, 0x1107, 0x1109, 0x110C, 0x110E, 0x1111, 0x1127, 0x112D, 0x112F].includes(context.backEnvironment.charCode)) { // ㄱ, ㄷ, ㅂ, ㅅ, ㅈ, ㅊ, ㅍ, ㅶ, ㅺ, ㅼ 앞
          phoneticSymbol = 'ɾp˺';
        } else if ([0x1102, 0x1106].includes(context.backEnvironment.charCode)) { // 초성 ㄴ, ㅁ 앞
          phoneticSymbol = 'ɾm';
        } else if (context.backEnvironment.charCode === 0x110B) { // 초성 ㅇ 앞
          phoneticSymbol = 'ɾb'
        } else if (context.backEnvironment.charCode === 0x1112) { // 초성 ㅎ 앞
          phoneticSymbol = 'ɾp';
        }
      }
      break;

    case 0x11D9: // ㄹㆆ
      phoneticSymbol = 'ɾ';
      break;

    case 0x11B3: // 종성 ㄽ
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤(받침에만 쓰임)
        if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 't˺';
        } else if ([0x1100, 0x1103, 0x1107, 0x1109, 0x110C, 0x110E, 0x1110, 0x1121].includes(context.backEnvironment.charCode)) { // 초성 ㄱ, ㄷ,  ㅂ, ㅅ, ㅈ, ㅊ, ㅌ, ㅄ 앞
          phoneticSymbol = 't˺';
        } else if ([0x1102, 0x1106].includes(context.backEnvironment.charCode)) { // 초성 ㄴ, ㅁ 앞
          phoneticSymbol = 'n';
        } else if (context.backEnvironment.charCode === 0x110B) { // 초성 ㅇ 앞
          phoneticSymbol = 'd'
        }
      }

    case 0x11C7: // 종성 ㅧ
      phoneticSymbol ='n';
      break;

    case 0x11C6: // 종성 ㅦ
      phoneticSymbol = 'n';
      break;

    case 0x11DD: // 종성 ㅯ
      phoneticSymbol = 'm';
      break;

    case 0x11DC: // 종성 ㅮ
      phoneticSymbol = 'm';
      break;

    case 0x11AA: // 종성 ᆪ
      if (context.frontEnvironment.type === 'middle') { // 모음 뒤(받침에만 쓰임)
        if (context.backEnvironment.type === null) { // 어말
          phoneticSymbol = 'k˺';
        } else if ([0x1100, 0x1103, 0x1107, 0x1109, 0x110C].includes(context.backEnvironment.charCode)) { // 초성 ㄱ, ㄷ,  ㅂ, ㅅ, ㅈ 앞
          phoneticSymbol = 'k˺';
        } else if ([0x1102, 0x1106].includes(context.backEnvironment.charCode)) { // 초성 ㄴ, ㅁ 앞
          phoneticSymbol = 'ŋ';
        }
      }
      break;
      
    case 0x11F1: // 종성 ᇱ // TODO ㅇㅅ이 아니라 옛ㅇㅅ이 맞는지 확인
      phoneticSymbol = 'ŋ';
      break;
    
    case 0x112E: // 초성 ㅻ 
      phoneticSymbol = 'sn';
      break;
      
    default:
      if (charCode in middleToPhoneticMap) { // (처리할 수 있는)모음
        phoneticSymbol = middleToPhoneticMap[charCode];
      } else { // 처리할 수 없는 코드
        phoneticSymbol = '?';
      }
      break;
  }

  return phoneticSymbol;
}

// TODO: 알고리즘 검증
// 앞쪽 음운환경을 반환
function getFrontEnvironment(splittedStr: string, currentIdx: number): FrontEnvironment {
  let frontEnvironment: FrontEnvironment = {
    type: null,
    charCode: 0
  }
  if (currentIdx > 0 && isMiddleChar(splittedStr.charCodeAt(currentIdx - 1))) {
    frontEnvironment.type = 'middle';
    frontEnvironment.charCode = splittedStr.charCodeAt(currentIdx - 1);
  } else if (currentIdx > 0 && isFinalChar(splittedStr.charCodeAt(currentIdx - 1))) {
    frontEnvironment.type = 'final';
    frontEnvironment.charCode = splittedStr.charCodeAt(currentIdx - 1);
  }
  return frontEnvironment
}

// TODO: 알고리즘 검증
// 뒤쪽 음운환경을 반환
function getBackEnvironment(splittedStr: string, currentIdx: number): BackEnvironment {
  let backEnvironment: BackEnvironment = {
    type: null,
    charCode: 0
  }
  if (currentIdx < (splittedStr.length - 1) && isMiddleChar(splittedStr.charCodeAt(currentIdx + 1))) {
    backEnvironment.type = 'middle';
    backEnvironment.charCode = splittedStr.charCodeAt(currentIdx + 1);
  } else if (currentIdx < (splittedStr.length - 1) && isInitialChar(splittedStr.charCodeAt(currentIdx + 1))) {
    backEnvironment.type = 'initial';
    backEnvironment.charCode = splittedStr.charCodeAt(currentIdx + 1);
  }
  return backEnvironment
}


function splittedStringToPhoneticSymbols(splittedStr: string) {
  let phoneticSymbols = '';

  for (let i = 0 ; i < splittedStr.length ; i ++) {
    let context: PronounceContext = {
      frontEnvironment: getFrontEnvironment(splittedStr, i),
      backEnvironment: getBackEnvironment(splittedStr, i)
    }
    if (splittedStr[i] === '\u000a' || splittedStr[i] === '\u0020') { // 띄어쓰기나 개행
      phoneticSymbols += splittedStr[i];

      continue;
    }
    if (context.backEnvironment.type !== null) {
      const backContextOfNextChar = getBackEnvironment(splittedStr, i + 1);
      phoneticSymbols += charCodeToPhoneticSymbol(splittedStr.charCodeAt(i), context, backContextOfNextChar);
    } else {
      phoneticSymbols += charCodeToPhoneticSymbol(splittedStr.charCodeAt(i), context);
    }

  }
  return phoneticSymbols;
}

// TODO 자음 하나만 있을 때 혹은 모음 하나만 있을 때 ex) ㅗㄱ/ 어떻게 처리할지 정하기.
