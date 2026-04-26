/**
 * Generates src/nicknames.json from a hand-curated list of equivalence groups.
 *
 * The carltonnorthern/nickname-and-diminutive-names-lookup CSV was used as a
 * reference but is not suitable for direct automated processing: it contains
 * unusual relationships (robert→bill, bert→bob, henrietta→hank) that merge
 * unrelated names into giant clusters when union-find or direct grouping is
 * applied.  A curated list gives predictable, testable behaviour.
 *
 * Run:  node build-nicknames.mjs
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const GROUPS = [
    // ── Male ──────────────────────────────────────────────────────────────
    ['ABE', 'ABRAHAM'],
    ['ALAN', 'ALASTAIR', 'ALISTAIR'],
    ['ALEC', 'ALEX', 'ALEXANDER', 'XANDER'],
    ['ALFIE', 'ALFRED'],
    ['ANDY', 'DREW', 'ANDREW'],
    ['ARCHIE', 'ARCHIBALD'],
    ['ART', 'ARTHUR'],
    ['BART', 'BARTHOLOMEW'],
    ['BEN', 'BENJI', 'BENNY', 'BENJAMIN'],
    ['BILL', 'BILLY', 'WILL', 'WILLIE', 'WILLIAM'],
    ['BOB', 'BOBBY', 'ROB', 'ROBBIE', 'ROBBY', 'ROBERT'],
    ['BRAM', 'IBRAHIM'],
    ['CHARLIE', 'CHARLES', 'CHUCK', 'CHAZ'],
    ['CHET', 'CHESTER'],
    ['CHRIS', 'CHRISTOPHER', 'KIT'],
    ['CLIFF', 'CLIFFORD'],
    ['DAN', 'DANNY', 'DANIEL'],
    ['DAVE', 'DAVEY', 'DAVID'],
    ['DICK', 'RICH', 'RICHIE', 'RICK', 'RICKY', 'RICHARD'],
    ['DON', 'DONNY', 'DONALD'],
    ['ED', 'EDDIE', 'EDWARD', 'NED', 'TED', 'TEDDY'],
    ['FRANK', 'FRANKIE', 'FRANCIS'],
    ['FRED', 'FREDDIE', 'FREDDY', 'FREDERICK'],
    ['GABE', 'GABRIEL'],
    ['GENE', 'EUGENE'],
    ['GEORGE', 'GEORGIE'],
    ['GREG', 'GREGG', 'GREGORY'],
    ['HAL', 'HANK', 'HARRY', 'HENRY'],
    ['IKE', 'ISAAC'],
    ['JACK', 'JOHN', 'JOHNNY'],
    ['JAKE', 'JACOB'],
    ['JIM', 'JIMMY', 'JAMES', 'JAMIE'],
    ['JOE', 'JOEY', 'JOSEPH'],
    ['KEN', 'KENNY', 'KENNETH'],
    ['LARRY', 'LAURENCE', 'LAWRENCE'],
    ['LEN', 'LENNY', 'LEONARD', 'LEO'],
    ['LOUIE', 'LOUIS'],
    ['MARTY', 'MARTIN'],
    ['MATT', 'MATTY', 'MATTHEW'],
    ['MICK', 'MIKE', 'MIKEY', 'MICHAEL'],
    ['NAT', 'NATE', 'NATHAN', 'NATHANIEL'],
    ['NICK', 'NICKY', 'NICHOLAS'],
    ['OLLIE', 'OLIVER'],
    ['PAT', 'PADDY', 'PATRICK'],
    ['PETE', 'PETER'],
    ['PHIL', 'PHILLIP', 'PHILIP'],
    ['RAY', 'RAYMOND'],
    ['RON', 'RONNIE', 'RONNY', 'RONALD'],
    ['RUDY', 'RUDOLPH'],
    ['RUSS', 'RUSTY', 'RUSSELL'],
    ['SAM', 'SAMMY', 'SAMUEL'],
    ['SANDY', 'SANDRA', 'CASSANDRA'],
    ['SID', 'SYDNEY', 'SIDNEY'],
    ['STEVE', 'STEPHEN', 'STEVEN'],
    ['STU', 'STEWART', 'STUART'],
    ['TIM', 'TIMMY', 'TIMOTHY'],
    ['TOM', 'TOMMY', 'THOMAS'],
    ['TONY', 'TONI', 'ANTHONY'],
    ['VIC', 'VICTOR'],
    ['VINCE', 'VINCENT'],
    ['WALLY', 'WALLACE'],
    ['ZACH', 'ZACHARY'],
    // ── Female ────────────────────────────────────────────────────────────
    ['ABBY', 'GAIL', 'ABIGAIL'],
    ['ADDIE', 'ADDY', 'ADELAIDE'],
    ['AGGIE', 'AGNES'],
    ['ALICE', 'ALICIA', 'ALLIE'],
    ['AMANDA', 'MANDY', 'MANDA'],
    ['AMY', 'AMELIA'],
    ['ANN', 'ANNA', 'ANNE', 'ANNIE'],
    ['BARB', 'BABS', 'BARBARA'],
    ['BEA', 'BEATRICE', 'BEATRIX', 'TRIXIE'],
    ['BECKY', 'BECCA', 'REBECCA'],
    ['CAROL', 'CAROLE', 'CAROLINE', 'CAROLYN', 'CARRIE'],
    ['CATHY', 'KATHY', 'KATE', 'KATIE', 'KAT', 'KITTY', 'KATHERINE', 'KATHARINE', 'KATHRYN'],
    ['CINDY', 'CYNDI', 'CYNTHIA'],
    ['CLAIRE', 'CLARA', 'CLARISSA'],
    ['CONNIE', 'CONSTANCE'],
    ['DEBBIE', 'DEBBY', 'DEB', 'DEBORAH'],
    ['DIANA', 'DIANE', 'DIANNE'],
    ['DOT', 'DOTTY', 'DOLLY', 'DOROTHY'],
    ['EDIE', 'EDITH'],
    ['ELEANOR', 'ELLIE', 'NELL', 'NELLIE', 'NORA', 'LEONORA'],
    ['BETTY', 'BETH', 'BESS', 'BESSIE', 'ELIZA', 'ELIZABETH', 'LIBBY', 'LIZ', 'LISA'],
    ['EMMA', 'EMMIE'],
    ['ESTHER', 'HESTER'],
    ['FLO', 'FLORA', 'FLORENCE'],
    ['FRAN', 'FRANNIE', 'FRANCES'],
    ['GINNY', 'GINA', 'VIRGINIA'],
    ['GWEN', 'WENDY', 'GWENDOLYN'],
    ['HARRIET', 'HATTIE'],
    ['HELEN', 'ELENA'],
    ['JEN', 'JENNY', 'JENNIE', 'JENNIFER'],
    ['JILL', 'JULIA', 'JULIE'],
    ['JUDY', 'JUDITH', 'JUDE'],
    ['LAURA', 'LAURIE', 'LORI'],
    ['LILY', 'LILLY', 'LILLIAN'],
    ['LINDA', 'LINDY'],
    ['LOTTIE', 'CHARLOTTE'],
    ['LUCY', 'LUCIA', 'LUCILLE', 'LUCINDA'],
    ['DAISY', 'MADGE', 'MAG', 'MAGGIE', 'MARGARET', 'MARGIE', 'MEG', 'PEGGY', 'PEG', 'RITA'],
    ['MAY', 'MAMIE', 'MARIE', 'MARY', 'MOLLY', 'POLLY'],
    ['MILLIE', 'MILLY', 'MILLICENT'],
    ['NANCY', 'NAN', 'NANETTE'],
    ['PATTY', 'PATRICIA', 'TRICIA', 'TRISH'],
    ['PENNY', 'PENELOPE'],
    ['PRISCILLA', 'PRISSY', 'CILLA'],
    ['ROSIE', 'ROSEMARY', 'ROSA', 'ROSE'],
    ['SADIE', 'SALLY', 'SARA', 'SARAH'],
    ['STELLA', 'ESTELLE'],
    ['SUE', 'SUZY', 'SUSAN', 'SUSANNA', 'SUSANNAH'],
    ['TABBY', 'TABITHA'],
    ['TESS', 'TESSA', 'TERESA', 'THERESA', 'TERRI', 'TERRY'],
    ['TILLY', 'MATILDA'],
    ['TINA', 'CHRISTINA'],
    ['TRUDY', 'GERTRUDE'],
    ['VICKY', 'VICTORIA'],
    ['WINNIE', 'WINIFRED'],
];

// Validate: no name appears in more than one group
const seen = new Map();
for (const group of GROUPS) {
    for (const name of group) {
        if (seen.has(name)) {
            console.error(`CONFLICT: ${name} appears in group [${group}] and [${seen.get(name)}]`);
            process.exit(1);
        }
        seen.set(name, group);
    }
}

writeFileSync(join(__dirname, 'src/nicknames.json'), JSON.stringify(GROUPS, null, 2));
console.log(`Written: ${GROUPS.length} groups, ${GROUPS.reduce((n, g) => n + g.length, 0)} total entries`);

// Spot-check
const map = new Map();
GROUPS.forEach((g, i) => g.forEach(n => map.set(n, i)));
const check = (a, b) => `${a}/${b}:${map.get(a) !== undefined && map.get(a) === map.get(b) ? '✓' : '✗'}`;
console.log(
    check('NICK', 'NICHOLAS'), check('BILL', 'WILLIAM'), check('BOB', 'ROBERT'),
    check('PEGGY', 'MARGARET'), check('CHUCK', 'CHARLES'),
    check('CINDY', 'CYNTHIA'), check('HANK', 'HENRY'), check('ALICE', 'BOB'),
    check('KATE', 'KATHERINE'), check('JIM', 'JAMES')
);
