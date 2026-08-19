# Image manifest - *Bizzing Bee* documentary (first four National Spelling Bees, 1925-1928)

Generated 2026-08-19. All files live in `/home/user/Bizzing-Bee/video/images/`.

**21 images downloaded, 204.0 MB total.** Every file below is a Creative Commons Zero (CC0) public-domain item from Smithsonian Open Access. No file in this folder is "rights unknown," and nothing here came from Getty, AP, Scripps or any other rights-managed agency.

---

## 1. Read this first: the network blocked every archive except one

This session sits behind an egress proxy that answers `403` to `CONNECT` for almost every
destination. Both `curl` and the WebFetch tool go through it, so a blocked host is blocked
for every method available here. The block is enforced at the proxy, not by the sites.

### Domains tested and BLOCKED (403 policy denial at the egress gateway)

| Domain | Result | What was lost |
|---|---|---|
| `www.loc.gov / api.loc.gov / tile.loc.gov / cdn.loc.gov / memory.loc.gov` | 403 blocked | **All Priority-1 spelling bee photographs.** See section 2. |
| `catalog.archives.gov (US National Archives)` | 403 blocked | NARA catalog search and downloads |
| `www.si.edu / ids.si.edu / api.si.edu / edan.si.edu` | 403 blocked | Smithsonian website + its image delivery service (worked around, see below) |
| `digitalcollections.nypl.org / images.nypl.org / iiif.nypl.org` | 403 blocked | NYPL Digital Collections |
| `www.biodiversitylibrary.org` | 403 blocked | Botanical plates - the ideal gladiolus source |
| `picryl.com / getarchive.net / nara.getarchive.net` | 403 blocked | Public-domain aggregator |
| `openverse.org` | 403 blocked | CC search aggregator |
| `archive.org / web.archive.org / ia600.us.archive.org / ia800.us.archive.org` | 403 blocked | Internet Archive (and therefore BHL scans) |
| `commons.wikimedia.org / upload.wikimedia.org` | 403 blocked | Wikimedia Commons |
| `www.gutenberg.org` | 403 blocked | Project Gutenberg |
| `www.flickr.com / live.staticflickr.com` | 403 blocked | Flickr Commons |
| `www.nps.gov / npgallery.nps.gov / media.defense.gov` | 403 blocked | Other US Government image sources |
| `unsplash.com / images.unsplash.com` | 403 blocked | - |
| `www.google.com / duckduckgo.com / huggingface.co` | 403 blocked | - |

### What WAS reachable

| Host | Result |
|---|---|
| `*.s3*.amazonaws.com` | **200 OK** - this is the whole reason this manifest exists |
| `storage.googleapis.com` | reachable (no useful collection found) |
| `github.com`, `api.github.com`, `registry.npmjs.org`, `pypi.org` | reachable (not image sources) |
| `nara-media.s3.amazonaws.com` | reachable, but `nara-catalog.s3.amazonaws.com` is **empty**, so there is no index to search it by - unusable without NAIDs |

**The workaround used for every image here:** Smithsonian Open Access publishes its complete
metadata *and* its full-resolution media to a public S3 bucket,
`smithsonian-open-access.s3-us-west-2.amazonaws.com`, which the proxy allows even though
`si.edu` itself does not resolve. Metadata lives at `metadata/edan/<unit>/<00-ff>.txt` as
line-delimited JSON (256 shards per museum unit); full-resolution media lives at
`media/<unit>/<image-id>.jpg` and `.tif`. Every record was found by downloading and grepping
those shards directly. The canonical `ids.si.edu` download URLs recorded below are the
*official* source URLs, and they are the ones to cite - they are simply not reachable from
this session, so the byte-identical S3 mirror path is given alongside each one.

---

## 2. Priority 1 - the bees themselves: NOT OBTAINED

**No photograph of the 1925-1928 National Spelling Bees was downloaded.** Every known image
of these events is held by the Library of Congress, and `loc.gov` is blocked at the proxy in
this session. This is a network restriction, not a rights problem: the LoC items below are
free to use.

The three specified items, plus what the LoC rights statement says for that collection:

| Item | URL | Status |
|---|---|---|
| Secretary to the President Everett Sanders congratulates Betty Robinson of South Bend, Indiana, on winning the fourth annual National Spelling Bee; contestants received by President Coolidge at the White House (1928) | https://www.loc.gov/item/2016888806/ | **Not downloaded - `www.loc.gov` returns 403 at the egress proxy** |
| President Coolidge and Betty Robinson (1928), Harris & Ewing | http://www.loc.gov/pictures/item/hec2013004930/ | **Not downloaded - blocked** |
| Winners in National Spelling Bee received by President Coolidge - Bessie Doig (Detroit, 3rd, $200), President Coolidge, Betty Robinson (South Bend, 1st, $1,000), Pauline Gray (1928) | http://www.loc.gov/pictures/item/2016890661/ | **Not downloaded - blocked** |
| "[President Coolidge, standing, full-length, with the seven finalists in the national spelling bee]" - found by web search, a fourth item worth chasing | https://www.loc.gov/item/94509235/ | **Not downloaded - blocked** |

Rights position for these, confirmed by web search of the Library's own pages (the pages
themselves could not be fetched):

> Items in the National Photo Company Collection carry a Rights Advisory stating
> **"No known restrictions on publication."**

> The Library of Congress does not own rights to material in its collections, so it does not
> license or charge permission fees for use of such material and cannot grant or deny
> permission to publish or otherwise distribute the material.

- Collection rights page: https://www.loc.gov/collections/national-photo-company/about-this-collection/rights-and-access/
- Formal statement for this collection: https://www.loc.gov/rr/print/res/275_npco.html

**Caveat worth checking before broadcast:** the 1928 White House item at `2016888806` is
credited in search results to **Harris & Ewing**, not to the National Photo Company. Harris &
Ewing material at LoC is generally also "no known restrictions," but the rights advisory
must be read on the item page itself before use - do not assume the National Photo Company
wording covers it.

**To finish Priority 1**, run these three URLs from any unrestricted network, take the TIFF
under "Download" on each item page, and copy the "Rights Advisory" field verbatim off the
item page. Nothing else is needed.

**Frank Neuhauser (1925 winner):** no freely-usable image was found. The well-known 1925
photographs are LoC/agency material and could not be reached or verified here. Treat as open.

---

## 3. Rights statement that applies to every file below

Each item's own machine-readable rights field, quoted verbatim from the Smithsonian record:

```json
"usage": { "access": "CC0" }
```

and at record level:

```json
"metadata_usage": { "access": "CC0" }
```

`CC0` is the Smithsonian Open Access designation for a Creative Commons Zero 1.0 Universal
Public Domain Dedication - no copyright, no permission needed, no attribution required, and
commercial use (including a monetised YouTube video) is permitted. The search that produced
this set **discarded any record whose media was not flagged `CC0`**, so nothing marked
"Usage conditions apply" or rights-unknown reached this folder.

Attribution is not legally required but is good practice; the credit line and collection are
given per item below.

---

## 4. The images

### Webster & the blue-backed speller

#### 1. `noah-webster-portrait-1833-herring-npg.jpg`

- **Shows:** Oil portrait of Noah Webster, seated, aged about 75, with quill, inkwell and an open book at his elbow. The standard Webster portrait.
- **Object title:** Noah Webster
- **Date:** Date: 1833
- **People:** Artist: James Herring, 12 Jan 1794 - 8 Oct 1867 | Sitter: Noah Webster, 16 Oct 1758 - 28 May 1843
- **Type:** Type: Painting
- **Held by:** National Portrait Gallery, Smithsonian Institution
- **Credit line (source's words):** Credit Line: National Portrait Gallery, Smithsonian Institution; gift of William A. Ellis
- **Source record:** http://n2t.net/ark:/65665/sm4d4a30ef4-4168-42d2-aade-d2004efd70da
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NPG-NPG_67_31.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/npg/NPG-NPG_67_31.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 8.34 MB, 3474x4000 px

#### 2. `noah-webster-print-1789-npg.jpg`

- **Shows:** Engraved portrait print of Noah Webster as a young man (1789), i.e. from the era of the first *American Spelling Book*.
- **Object title:** Noah Webster
- **Date:** Date: 1789
- **People:** Artist: Unidentified Artist | Sitter: Noah Webster, 16 Oct 1758 - 28 May 1843
- **Type:** Type: Print
- **Held by:** National Portrait Gallery, Smithsonian Institution
- **Credit line (source's words):** Credit Line: National Portrait Gallery, Smithsonian Institution
- **Source record:** http://n2t.net/ark:/65665/sm47b53cceb-ed13-48d4-83b6-afe490df5000
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NPG-NPG_78_90.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/npg/NPG-NPG_78_90.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 10.85 MB, 2437x4000 px

#### 3. `webster-american-spelling-book-1821-cover-nmah.jpg`

- **Shows:** The actual object: Noah Webster's *The American Spelling Book*, Holbrook and Fessenden, Brattleborough (Brattleboro), Vermont, 1821 - the "blue backed speller." Cover / three-quarter view showing the worn blue-grey paper-covered boards.
- **Object title:** The American Spelling Book
- **Date:** not stated in the record
- **Type:** Object Name: book
- **Held by:** National Museum of American History, Smithsonian Institution
- **Credit line (source's words):** Credit Line: Gift of John Brenton Copp
- **Source record:** https://n2t.net/ark:/65665/ng49ca746ae-12d3-704b-e053-15f76fa0b4fa
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NMAH-AHB2014q066510.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/nmah/NMAH-AHB2014q066510.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 1.25 MB, 4000x3000 px

#### 4. `webster-american-spelling-book-1821-pages-nmah.jpg`

- **Shows:** The same 1821 *American Spelling Book*, opened to show interior pages.
- **Object title:** The American Spelling Book
- **Date:** not stated in the record
- **Type:** Object Name: book
- **Held by:** National Museum of American History, Smithsonian Institution
- **Credit line (source's words):** Credit Line: Gift of John Brenton Copp
- **Source record:** https://n2t.net/ark:/65665/ng49ca746ae-12d3-704b-e053-15f76fa0b4fa
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NMAH-AHB2014q066511.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/nmah/NMAH-AHB2014q066511.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 1.33 MB, 4000x3000 px

#### 5. `noah-webster-schoolmaster-of-the-republic-print-nmah.jpg`

- **Shows:** Chromolithograph, "Noah Webster - The Schoolmaster of the Republic": a bust portrait of Webster over a manuscript dictionary page, surrounded by copies of his dictionary, with a blue-covered *Elementary Spelling Book*, inkwell and quills in the foreground. The single best single-image summary of the Webster story.
- **Object title:** Noah Webster the Schoolmaster of the Republic
- **Date:** date made: before 1885
- **People:** depicted: Webster, Noah | maker: Root & Tinker
- **Type:** Object Name: chromolithograph | Object Type: Chromolithograph
- **Held by:** National Museum of American History, Smithsonian Institution
- **Credit line (source's words):** Credit Line: Harry T. Peters "America on Stone" Lithography Collection
- **Source record:** https://n2t.net/ark:/65665/ng49ca746a1-3c1c-704b-e053-15f76fa0b4fa
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NMAH-RWS2014-03194.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/nmah/NMAH-RWS2014-03194.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 14.99 MB, 4318x3436 px

#### 6. `esther-copp-spelling-book-c1767-nmah.jpg`

- **Shows:** Esther Copp's spelling book, used by a 13-year-old girl in Stonington, Connecticut c. 1767 - a pre-Webster American spelling book, useful for the "before Webster" beat.
- **Object title:** Esther Copp’s Spelling Book
- **Date:** not stated in the record
- **People:** associated person: Copp, Esther
- **Type:** Object Name: book | Other Terms: Book; Printed
- **Held by:** National Museum of American History, Smithsonian Institution
- **Credit line (source's words):** Credit Line: Gift of John Brenton Copp
- **Source record:** https://n2t.net/ark:/65665/ng49ca746b3-7486-704b-e053-15f76fa0b4fa
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NMAH-AHB2014q068163.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/nmah/NMAH-AHB2014q068163.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 1.54 MB, 4000x3000 px


### 19th-century American schoolroom

#### 7. `red-school-house-childs-bank-1892-1906-nmah.jpg`

- **Shows:** Child's still bank in the form of a little red schoolhouse, 1892-1906. A clean, iconic "one-room schoolhouse" object on a plain background - easy to cut out and animate.
- **Object title:** Red School House Child's Bank
- **Date:** date made: 1892-1906
- **Type:** Object Name: bank | Object Type: educational toys
- **Held by:** National Museum of American History, Smithsonian Institution
- **Credit line (source's words):** Credit Line: Gift of Dr. Richard Lodish American School Collection
- **Source record:** https://n2t.net/ark:/65665/ng49ca746b0-e1a1-704b-e053-15f76fa0b4fa
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NMAH-JN2015-7723-000001.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/nmah/NMAH-JN2015-7723-000001.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 9.62 MB, 3000x2250 px

#### 8. `the-village-school-lithograph-c1870-nmah.jpg`

- **Shows:** Colour lithograph "The Village School" (Burrow-Giles Lithographic Company, ca. 1870): a one-room schoolroom in uproar - schoolmaster asleep at his desk, pupils fighting, turning the clock forward and caricaturing the teacher on the blackboard. Excellent for the spelling-school / spelling-bee-as-village-entertainment section.
- **Object title:** The Village School by Burrow-Giles Lithographic Company
- **Date:** date made: ca 1870
- **People:** maker: Burrow-Giles Lith. Company
- **Type:** Object Name: chromolithograph | Object Type: Chromolithograph
- **Held by:** National Museum of American History, Smithsonian Institution
- **Credit line (source's words):** Credit Line: Harry T. Peters "America on Stone" Lithography Collection
- **Source record:** https://n2t.net/ark:/65665/ng49ca746a1-241a-704b-e053-15f76fa0b4fa
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NMAH-2003-19801.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/nmah/NMAH-2003-19801.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 0.62 MB, 942x617 px

#### 9. `brass-school-bell-eagle-handle-nmah.jpg`

- **Shows:** Brass hand school bell with an American eagle handle, 1875-1930, from the Richard Lodish American School Collection. Very high resolution; good for a close-up transition.
- **Object title:** Brass School Bell with Eagle Handle
- **Date:** date made: 1875-1930
- **Type:** Object Name: school bell
- **Held by:** National Museum of American History, Smithsonian Institution
- **Credit line (source's words):** Credit Line: Gift of Dr. Richard Lodish American School Collection
- **Source record:** https://n2t.net/ark:/65665/ng49ca746b3-0dd3-704b-e053-15f76fa0b4fa
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NMAH-JN2016-02739-000001.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/nmah/NMAH-JN2016-02739-000001.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 8.6 MB, 6890x9185 px


### Gladiolus

#### 10. `gladiolus-imbricatus-herbarium-specimen-nmnh.jpg`

- **Shows:** Herbarium sheet, *Gladiolus imbricatus* L., United States National Museum specimen no. 1703853, collected in Middle Europe by Heinr. Laus and Ferdinand Weber (Flora Cechoslovenica exsiccata). Shows the pressed plant with its purple flowers, the printed determination label and the USNM accession stamp. NOTE: this is a pressed specimen, not a painted botanical plate - see the gap note below. The record gives the collection date as 5 Jul 1932; the printed label on the sheet reads `5. VII. 193[2/5]` and is hard to read at the last digit, so cite the record's 1932 rather than the label.
- **Object title:** Gladiolus imbricatus L.
- **Date:** Collection Date: 5 Jul 1932
- **People:** Biogeographical Region: 11 - Middle Europe | Collector: Heinr. Laus | Collector: Ferdinand Weber
- **Held by:** National Museum of Natural History (Department of Botany), Smithsonian Institution
- **Source record:** http://n2t.net/ark:/65665/323527d65-5aa6-4337-8b89-91b84ac80fac
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NMNH-03947269.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/nmnh/NMNH-03947269.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 60.81 MB, 6836x9051 px


### Coolidge & 1920s America

#### 11. `calvin-coolidge-photo-c1924-ulmann-npg.jpg`

- **Shows:** Photographic portrait of President Calvin Coolidge by Doris Ulmann, c. 1924, signed by the photographer. A genuine period photograph and the best Coolidge likeness in this set.
- **Object title:** Calvin Coolidge
- **Date:** Date: c. 1924
- **People:** Artist: Doris Ulmann, 29 May 1882 - 28 Aug 1934 | Sitter: Calvin Coolidge, 4 Jul 1872 - 5 Jan 1933
- **Type:** Type: Photograph
- **Held by:** National Portrait Gallery, Smithsonian Institution
- **Credit line (source's words):** Credit Line: National Portrait Gallery, Smithsonian Institution
- **Source record:** http://n2t.net/ark:/65665/sm484a03eac-5aed-420a-a008-8cbba5e44a1f
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NPG-NPG_85_90Coolidge-000001.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/npg/NPG-NPG_85_90Coolidge-000001.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 9.69 MB, 3187x4000 px

#### 12. `calvin-coolidge-drawing-1923-woolf-npg.jpg`

- **Shows:** Charcoal/crayon drawing of Coolidge by Samuel Johnson Woolf, 1923.
- **Object title:** Calvin Coolidge
- **Date:** Date: 1923
- **People:** Artist: Samuel Johnson Woolf, 12 Feb 1880 - 3 Dec 1948 | Sitter: Calvin Coolidge, 4 Jul 1872 - 5 Jan 1933
- **Type:** Type: Drawing
- **Held by:** National Portrait Gallery, Smithsonian Institution
- **Credit line (source's words):** Credit Line: National Portrait Gallery, Smithsonian Institution; gift of the artist's daughters, Muriel Woolf Hobson and Dorothy Woolf Ahern
- **Source record:** http://n2t.net/ark:/65665/sm459fe4d33-bd45-4c90-b48c-c28d7a87eea8
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NPG-NPG_87_174Coolidge-000001.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/npg/NPG-NPG_87_174Coolidge-000001.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 11.38 MB, 3127x4000 px

#### 13. `calvin-coolidge-print-1925-sturges-npg.jpg`

- **Shows:** Etching of Coolidge by Dwight Case Sturges, 1925 - the year of the first National Spelling Bee.
- **Object title:** Calvin Coolidge
- **Date:** Date: 1925
- **People:** Artist: Dwight Case Sturges, 1874 - 1940 | Sitter: Calvin Coolidge, 4 Jul 1872 - 5 Jan 1933
- **Type:** Type: Print
- **Held by:** National Portrait Gallery, Smithsonian Institution
- **Credit line (source's words):** Credit Line: National Portrait Gallery, Smithsonian Institution
- **Source record:** http://n2t.net/ark:/65665/sm45de558cf-939a-4df1-9ceb-a980268dae79
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NPG-7800534B_1.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/npg/NPG-7800534B_1.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 1.66 MB, 3087x4000 px

#### 14. `ford-model-t-roadster-1926-nmah.jpg`

- **Shows:** A 1926 Ford Model T roadster (museum photograph of the actual vehicle, plain background).
- **Object title:** 1926 Ford Model T roadster
- **Date:** Date made: 1926
- **People:** founder of Ford Motor Company: Ford, Henry | maker: Ford Motor Company
- **Type:** Object Name: roadster | Object Name: automobile
- **Held by:** National Museum of American History, Smithsonian Institution
- **Credit line (source's words):** Credit Line: John T. Sickler
- **Source record:** https://n2t.net/ark:/65665/ng49ca746a5-61d3-704b-e053-15f76fa0b4fa
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NMAH-2003-32650.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/nmah/NMAH-2003-32650.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 4.89 MB, 3008x2000 px


### 1927: Lindbergh

#### 15. `spirit-of-st-louis-nasm-a.jpg`

- **Shows:** The actual Ryan NYP "Spirit of St. Louis" (1927) suspended in the National Air and Space Museum, showing the fuselage registration N-X-211. Museum photograph of the historic aircraft, not a 1927 press photo.
- **Object title:** Ryan NYP "Spirit of St. Louis", Charles A. Lindbergh
- **Date:** Date: 1927
- **People:** Pilot: Charles A. Lindbergh | Manufacturer: Ryan Aircraft Co.
- **Type:** Type: CRAFT-Aircraft
- **Held by:** National Air and Space Museum, Smithsonian Institution
- **Credit line (source's words):** Credit Line: Gift of the Spirit of St. Louis Corporation
- **Source record:** http://n2t.net/ark:/65665/nv902b19e41-7d71-4e71-999a-957595426799
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NASM-SI-98-16295.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/nasm/NASM-SI-98-16295.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 1.26 MB, 3000x2277 px

#### 16. `spirit-of-st-louis-nasm-b.jpg`

- **Shows:** Interior of the Spirit of St. Louis cockpit - instrument panel, control stick and wicker seat, as Lindbergh flew it. Museum photograph of the historic aircraft.
- **Object title:** Ryan NYP "Spirit of St. Louis", Charles A. Lindbergh
- **Date:** Date: 1927
- **People:** Pilot: Charles A. Lindbergh | Manufacturer: Ryan Aircraft Co.
- **Type:** Type: CRAFT-Aircraft
- **Held by:** National Air and Space Museum, Smithsonian Institution
- **Credit line (source's words):** Credit Line: Gift of the Spirit of St. Louis Corporation
- **Source record:** http://n2t.net/ark:/65665/nv902b19e41-7d71-4e71-999a-957595426799
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=NASM-SI-2001-136.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/nasm/NASM-SI-2001-136.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 3.96 MB, 4801x6031 px


### The National Museum building, Washington D.C.

#### 17. `arts-industries-building-north-facade-1880s-sia.jpg`

- **Shows:** Exterior, north facade of the United States National Museum (now the Arts and Industries Building) on the Mall. Dated 1880s by the Archives; the building's exterior was essentially unchanged in the 1920s.
- **Object title:** Exterior View of North Facade of the Arts and Industries Building
- **Date:** Date: 1880 | Date: 1880s
- **People:** Creator: United States National Museum Photographic Laboratory | Subject: United States National Museum | Subject: Arts and Industries Building (Washington, D.C.)
- **Type:** Type: Glass negatives
- **Held by:** Smithsonian Institution Archives
- **Source record:** None
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=SIA-MAH-2888-000002.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/sia/SIA-MAH-2888-000002.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 2.95 MB, 6054x4859 px

#### 18. `us-national-museum-exterior-1880s-sia.jpg`

- **Shows:** Another exterior view of the United States National Museum, now the Arts and Industries Building. Dated 1880s.
- **Object title:** Exterior View of the United States National Museum
- **Date:** Date: 1880 | Date: 1880s
- **People:** Creator: United States National Museum Photographic Laboratory | Subject: United States National Museum | Subject: Arts and Industries Building (Washington, D.C.)
- **Type:** Type: Glass negatives
- **Held by:** Smithsonian Institution Archives
- **Source record:** None
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=SIA-MAH-2990-000002.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/sia/SIA-MAH-2990-000002.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 2.67 MB, 4816x6046 px

#### 19. `arts-industries-building-interior-transportation-c1920s-sia.jpg`

- **Shows:** Interior of the Arts and Industries Building, circa 1920s - the land transportation hall with the "John Bull" locomotive, showing the patterned tile floor, iron balcony and skylights. The best available look at the room-scale interior in the bee years.
- **Object title:** Land Transportation Exhibits, Arts and Industries Building
- **Date:** Date: 1920 | Date: Circa 1920s
- **People:** Creator: United States National Museum Photographic Laboratory | Subject: Arts and Industries Building (Washington, D.C.) | Subject: United States National Museum
- **Type:** Type: Black-and-white photographs
- **Held by:** Smithsonian Institution Archives
- **Source record:** None
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=SIA-SIA_000095_B42_F28_003.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/sia/SIA-SIA_000095_B42_F28_003.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 19.14 MB, 4870x6000 px

#### 20. `us-national-museum-interior-inventions-exhibit-c1920-sia.jpg`

- **Shows:** Interior of the United States National Museum / Arts and Industries Building, circa 1920 - exhibit case for the "Synoptic History of Inventions: Metalworking Process." A period-correct 1920s interior of the building.
- **Object title:** "Synoptic History of Inventions" Exhibit, United States National Museum
- **Date:** Date: 1920 | Date: Before 1920
- **People:** Creator: United States National Museum Photographic Laboratory | Subject: Arts and Industries Building (Washington, D.C.) | Subject: United States National Museum
- **Type:** Type: Photographs
- **Held by:** Smithsonian Institution Archives
- **Source record:** None
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=SIA-SIA_000095_B42_F26_001.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/sia/SIA-SIA_000095_B42_F26_001.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 26.41 MB, 6000x4848 px

#### 21. `central-market-vendors-outside-national-museum-1909-sia.jpg`

- **Shows:** Street vendors, horses and wagons at Central Market outside the National Museum, 9 October 1909. Period Washington D.C. street life.
- **Object title:** United States National Museum, Vendors at Central Market Outside the Museum
- **Date:** Date: 1909 | Date: October 9, 1909
- **People:** Subject: United States National Museum | Subject: National Museum of Natural History (U.S.)
- **Type:** Type: Black-and-white photographs
- **Held by:** Smithsonian Institution Archives
- **Source record:** None
- **Canonical image URL (official, blocked here):** https://ids.si.edu/ids/download?id=SIA-SIA2009-1990-000001.jpg
- **Downloaded from (S3 mirror, byte-identical):** https://smithsonian-open-access.s3-us-west-2.amazonaws.com/media/sia/SIA-SIA2009-1990-000001.jpg
- **Rights, verbatim from the record:** `"usage": { "access": "CC0" }` - Creative Commons Zero, public domain dedication
- **Size / dimensions:** 2.07 MB, 3000x2397 px


---

## 5. Gaps - things asked for that are NOT in this folder

| Wanted | Status | Why |
|---|---|---|
| 1925-1928 spelling bee photographs (all of Priority 1) | **missing** | `loc.gov` blocked; see section 2 |
| Frank Neuhauser, 1925 winner | **missing** | no free, rights-verified image located |
| Gladiolus as a *painted botanical plate* | **substituted** | got a real herbarium specimen sheet instead. Biodiversity Heritage Library and archive.org - where pre-1930 colour plates live - are both blocked. Smithsonian has no CC0 gladiolus illustration or garden photograph (searched NMNH Botany, Smithsonian Gardens, Cooper Hewitt, Horticulture, Smithsonian Libraries). |
| A 1920s radio set | **missing** | NMAH's radio holdings turned up no CC0-flagged images (searched `Radiola`, `Atwater Kent`, `Crosley`, `radio set`, `superheterodyne`, `broadcast receiver`, `loudspeaker`, `crystal set`) |
| A 1920s newsroom / printing press | **partial / not downloaded** | NMAH has many CC0 printing presses, but all are 19th-century **patent models** (small brass desk models), not a 1920s newspaper pressroom. Misleading as "the *Courier-Journal* going to press," so none were taken. |
| A 1920s department store, or a fashion plate showing cerise | **missing** | Cooper Hewitt's CC0 fashion plates are all 1786-1888. The only "cerise" hits are 18th-19th century textiles. Nothing 1920s, nothing that reads as a department store. |
| A 1920s classroom photograph | **substituted** | no CC0 1920s classroom photo found. The Village School lithograph (c. 1870) and the schoolhouse bank / school bell objects cover the schoolroom beat instead. |
| 1929 stock market crash / Wall Street crowds | **missing** | the canonical images are LoC (New York World-Telegram & Sun collection) and agency material. LoC blocked; nothing CC0 at the Smithsonian. |

---

## 6. Ambiguous or worth-a-second-look

Nothing in this folder has ambiguous rights - every file carries an explicit `CC0` flag in
its source record. Three items are ambiguous in *content* rather than in rights, and should
not be captioned carelessly:

1. **`spirit-of-st-louis-nasm-a.jpg` / `-b.jpg`** are modern museum photographs of the real
   1927 aircraft, taken in the National Air and Space Museum. They are CC0 and safe to use,
   but they are *not* 1927 photographs - do not caption them as if Lindbergh had just landed.
2. **`arts-industries-building-north-facade-1880s-sia.jpg`** and
   **`us-national-museum-exterior-1880s-sia.jpg`** are dated **1880s** by the Archives, not
   1920s. The building looked substantially the same in 1925-28, but the caption should say
   "the National Museum building, photographed in the 1880s" rather than imply a bee-era shot.
   The two *interior* views (`...c1920-sia.jpg`, `...c1920s-sia.jpg`) genuinely are circa 1920.
3. **`gladiolus-imbricatus-herbarium-specimen-nmnh.jpg`** is a pressed and mounted specimen
   collected in **1932 in Middle Europe** (Flora Cechoslovenica exsiccata), not an American
   garden gladiolus of 1925. It is a fine visual for the word, but it is a museum specimen
   sheet and reads as one. It is also the largest file here at 61 MB (6836 x 9051 px) - worth
   downscaling before it goes on a timeline.

Also note **`the-village-school-lithograph-c1870-nmah.jpg` is only 942 x 617 px** - the
Smithsonian offers no larger derivative. It is fine as a small inset or a slow push-in on a
1080p timeline, but it will not hold a full-frame 4K shot.


---

# PART 2 — GENERATED ILLUSTRATIONS (not archival)

**Everything below is AI-generated artwork made for this film. None of it is a photograph,
a document, or a historical record, and none of it may ever be captioned as one.**

Regenerate with `../plates.py --all`. Model `gemini-3-pro-image`, 2K, prompts in that file.

Two rules enforced in `plates.py`, both about honesty rather than taste:

1. **No generated picture of a real person.** There is no slot for a face and there must
   never be one. Marie Bolden, Frank Neuhauser and Edna Stover have no free photograph, so
   the film carries them **typographically**. A synthesised face presented as a historical
   figure is a fabrication dressed as a document.
2. **Nothing reads as a photograph.** Every plate is openly an illustration — inked line,
   flat inks, visible drawing. This is what stops a generated image being mistaken for
   archive footage when it sits three seconds away from a real Library of Congress
   photograph. The viewer must never have to guess which is which.

| File | Shows | Used in |
|---|---|---|
| `plate-theatre-stage.png` | Large 1908 theatre from the stalls, lit stage | §01 |
| `plate-theatre-spot.png` | Bare boards under a single overhead circle | §01 |
| `plate-schoolhouse-night.png` | One-room prairie schoolhouse at night, buggies outside | §03 |
| `plate-schoolroom-interior.png` | Packed lamplit schoolroom, all backs and silhouettes | §03 |
| `plate-pressroom.png` | 1920s newspaper pressroom, rotary presses | §05 |
| `plate-shopwindow-1920s.png` | 1920s department-store window, one cerise dress | §08 |
| `plate-prohibition.png` | Empty 1920s courtroom | §09 |
| `plate-medal.png` | A blank gold medal on indigo (1:1, for the §04 animation) | §04 |
| `plate-empty-stage-dawn.png` | The same theatre, house lights up, stage bare | §12 |

**The theatre is NOT the Hippodrome.** No reference for that building was obtainable, and
captioning a drawing as a named real venue is the same fabrication rule 1 forbids. It is "a
theatre in 1908", and the narration never claims more.

**AI disclosure:** these plates are why the video description must carry a synthetic-media
disclosure. That is not optional and not a formality.


## ⚠️ CORRECTION — the "1925 finalists" photograph is 1926

`spelling-bee-1926-finalists-coolidge-loc.jpg` (LoC, `loc.gov/item/94509235/`) was
downloaded and filed as the **1925** finalists. Its own typed caption, legible at full
resolution, reads:

> *"With finalists in National Spelling Bee.  6/4/26   neg. 40125"*

**It is 1926.** It had already been wired into §06 as the 1925 final, which would have put
a misdated photograph on screen in a film whose entire subject is which year came first.

Fixed: renamed, and §06 now carries that beat in type ("nine finalists · six girls, three
boys") which claims only what is true. The photograph moved to §08, the 1926 section, where
it is correct — displacing the cerise shop-window illustration, because a real photograph of
the actual bee outranks a drawing of a fashion colour.

**Read the caption strip on every archive photograph before wiring it to a date.** The
filename is whatever the downloader typed; the caption is what the archive says.
