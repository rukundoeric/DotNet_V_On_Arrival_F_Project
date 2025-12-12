using Microsoft.EntityFrameworkCore;
using VisaOnArrivalApi.Models;

namespace VisaOnArrivalApi.Data;

public static class CountrySeeder
{
    public static async Task SeedCountriesAsync(ApplicationDbContext context)
    {
        if (await context.Countries.AnyAsync())
        {
            return; // Countries already seeded
        }

        var countries = new List<Country>
        {
            // A
            new Country { Name = "Afghanistan", Code = "AFG", Code2 = "AF", IsActive = true },
            new Country { Name = "Albania", Code = "ALB", Code2 = "AL", IsActive = true },
            new Country { Name = "Algeria", Code = "DZA", Code2 = "DZ", IsActive = true },
            new Country { Name = "Andorra", Code = "AND", Code2 = "AD", IsActive = true },
            new Country { Name = "Angola", Code = "AGO", Code2 = "AO", IsActive = true },
            new Country { Name = "Antigua and Barbuda", Code = "ATG", Code2 = "AG", IsActive = true },
            new Country { Name = "Argentina", Code = "ARG", Code2 = "AR", IsActive = true },
            new Country { Name = "Armenia", Code = "ARM", Code2 = "AM", IsActive = true },
            new Country { Name = "Australia", Code = "AUS", Code2 = "AU", IsActive = true },
            new Country { Name = "Austria", Code = "AUT", Code2 = "AT", IsActive = true },
            new Country { Name = "Azerbaijan", Code = "AZE", Code2 = "AZ", IsActive = true },

            // B
            new Country { Name = "Bahamas", Code = "BHS", Code2 = "BS", IsActive = true },
            new Country { Name = "Bahrain", Code = "BHR", Code2 = "BH", IsActive = true },
            new Country { Name = "Bangladesh", Code = "BGD", Code2 = "BD", IsActive = true },
            new Country { Name = "Barbados", Code = "BRB", Code2 = "BB", IsActive = true },
            new Country { Name = "Belarus", Code = "BLR", Code2 = "BY", IsActive = true },
            new Country { Name = "Belgium", Code = "BEL", Code2 = "BE", IsActive = true },
            new Country { Name = "Belize", Code = "BLZ", Code2 = "BZ", IsActive = true },
            new Country { Name = "Benin", Code = "BEN", Code2 = "BJ", IsActive = true },
            new Country { Name = "Bhutan", Code = "BTN", Code2 = "BT", IsActive = true },
            new Country { Name = "Bolivia", Code = "BOL", Code2 = "BO", IsActive = true },
            new Country { Name = "Bosnia and Herzegovina", Code = "BIH", Code2 = "BA", IsActive = true },
            new Country { Name = "Botswana", Code = "BWA", Code2 = "BW", IsActive = true },
            new Country { Name = "Brazil", Code = "BRA", Code2 = "BR", IsActive = true },
            new Country { Name = "Brunei", Code = "BRN", Code2 = "BN", IsActive = true },
            new Country { Name = "Bulgaria", Code = "BGR", Code2 = "BG", IsActive = true },
            new Country { Name = "Burkina Faso", Code = "BFA", Code2 = "BF", IsActive = true },
            new Country { Name = "Burundi", Code = "BDI", Code2 = "BI", IsActive = true },

            // C
            new Country { Name = "Cambodia", Code = "KHM", Code2 = "KH", IsActive = true },
            new Country { Name = "Cameroon", Code = "CMR", Code2 = "CM", IsActive = true },
            new Country { Name = "Canada", Code = "CAN", Code2 = "CA", IsActive = true },
            new Country { Name = "Cape Verde", Code = "CPV", Code2 = "CV", IsActive = true },
            new Country { Name = "Central African Republic", Code = "CAF", Code2 = "CF", IsActive = true },
            new Country { Name = "Chad", Code = "TCD", Code2 = "TD", IsActive = true },
            new Country { Name = "Chile", Code = "CHL", Code2 = "CL", IsActive = true },
            new Country { Name = "China", Code = "CHN", Code2 = "CN", IsActive = true },
            new Country { Name = "Colombia", Code = "COL", Code2 = "CO", IsActive = true },
            new Country { Name = "Comoros", Code = "COM", Code2 = "KM", IsActive = true },
            new Country { Name = "Congo", Code = "COG", Code2 = "CG", IsActive = true },
            new Country { Name = "Congo (Democratic Republic)", Code = "COD", Code2 = "CD", IsActive = true },
            new Country { Name = "Costa Rica", Code = "CRI", Code2 = "CR", IsActive = true },
            new Country { Name = "Croatia", Code = "HRV", Code2 = "HR", IsActive = true },
            new Country { Name = "Cuba", Code = "CUB", Code2 = "CU", IsActive = true },
            new Country { Name = "Cyprus", Code = "CYP", Code2 = "CY", IsActive = true },
            new Country { Name = "Czech Republic", Code = "CZE", Code2 = "CZ", IsActive = true },

            // D
            new Country { Name = "Denmark", Code = "DNK", Code2 = "DK", IsActive = true },
            new Country { Name = "Djibouti", Code = "DJI", Code2 = "DJ", IsActive = true },
            new Country { Name = "Dominica", Code = "DMA", Code2 = "DM", IsActive = true },
            new Country { Name = "Dominican Republic", Code = "DOM", Code2 = "DO", IsActive = true },

            // E
            new Country { Name = "Ecuador", Code = "ECU", Code2 = "EC", IsActive = true },
            new Country { Name = "Egypt", Code = "EGY", Code2 = "EG", IsActive = true },
            new Country { Name = "El Salvador", Code = "SLV", Code2 = "SV", IsActive = true },
            new Country { Name = "Equatorial Guinea", Code = "GNQ", Code2 = "GQ", IsActive = true },
            new Country { Name = "Eritrea", Code = "ERI", Code2 = "ER", IsActive = true },
            new Country { Name = "Estonia", Code = "EST", Code2 = "EE", IsActive = true },
            new Country { Name = "Eswatini", Code = "SWZ", Code2 = "SZ", IsActive = true },
            new Country { Name = "Ethiopia", Code = "ETH", Code2 = "ET", IsActive = true },

            // F
            new Country { Name = "Fiji", Code = "FJI", Code2 = "FJ", IsActive = true },
            new Country { Name = "Finland", Code = "FIN", Code2 = "FI", IsActive = true },
            new Country { Name = "France", Code = "FRA", Code2 = "FR", IsActive = true },

            // G
            new Country { Name = "Gabon", Code = "GAB", Code2 = "GA", IsActive = true },
            new Country { Name = "Gambia", Code = "GMB", Code2 = "GM", IsActive = true },
            new Country { Name = "Georgia", Code = "GEO", Code2 = "GE", IsActive = true },
            new Country { Name = "Germany", Code = "DEU", Code2 = "DE", IsActive = true },
            new Country { Name = "Ghana", Code = "GHA", Code2 = "GH", IsActive = true },
            new Country { Name = "Greece", Code = "GRC", Code2 = "GR", IsActive = true },
            new Country { Name = "Grenada", Code = "GRD", Code2 = "GD", IsActive = true },
            new Country { Name = "Guatemala", Code = "GTM", Code2 = "GT", IsActive = true },
            new Country { Name = "Guinea", Code = "GIN", Code2 = "GN", IsActive = true },
            new Country { Name = "Guinea-Bissau", Code = "GNB", Code2 = "GW", IsActive = true },
            new Country { Name = "Guyana", Code = "GUY", Code2 = "GY", IsActive = true },

            // H
            new Country { Name = "Haiti", Code = "HTI", Code2 = "HT", IsActive = true },
            new Country { Name = "Honduras", Code = "HND", Code2 = "HN", IsActive = true },
            new Country { Name = "Hungary", Code = "HUN", Code2 = "HU", IsActive = true },

            // I
            new Country { Name = "Iceland", Code = "ISL", Code2 = "IS", IsActive = true },
            new Country { Name = "India", Code = "IND", Code2 = "IN", IsActive = true },
            new Country { Name = "Indonesia", Code = "IDN", Code2 = "ID", IsActive = true },
            new Country { Name = "Iran", Code = "IRN", Code2 = "IR", IsActive = true },
            new Country { Name = "Iraq", Code = "IRQ", Code2 = "IQ", IsActive = true },
            new Country { Name = "Ireland", Code = "IRL", Code2 = "IE", IsActive = true },
            new Country { Name = "Israel", Code = "ISR", Code2 = "IL", IsActive = true },
            new Country { Name = "Italy", Code = "ITA", Code2 = "IT", IsActive = true },
            new Country { Name = "Ivory Coast", Code = "CIV", Code2 = "CI", IsActive = true },

            // J
            new Country { Name = "Jamaica", Code = "JAM", Code2 = "JM", IsActive = true },
            new Country { Name = "Japan", Code = "JPN", Code2 = "JP", IsActive = true },
            new Country { Name = "Jordan", Code = "JOR", Code2 = "JO", IsActive = true },

            // K
            new Country { Name = "Kazakhstan", Code = "KAZ", Code2 = "KZ", IsActive = true },
            new Country { Name = "Kenya", Code = "KEN", Code2 = "KE", IsActive = true },
            new Country { Name = "Kiribati", Code = "KIR", Code2 = "KI", IsActive = true },
            new Country { Name = "Kosovo", Code = "XKX", Code2 = "XK", IsActive = true },
            new Country { Name = "Kuwait", Code = "KWT", Code2 = "KW", IsActive = true },
            new Country { Name = "Kyrgyzstan", Code = "KGZ", Code2 = "KG", IsActive = true },

            // L
            new Country { Name = "Laos", Code = "LAO", Code2 = "LA", IsActive = true },
            new Country { Name = "Latvia", Code = "LVA", Code2 = "LV", IsActive = true },
            new Country { Name = "Lebanon", Code = "LBN", Code2 = "LB", IsActive = true },
            new Country { Name = "Lesotho", Code = "LSO", Code2 = "LS", IsActive = true },
            new Country { Name = "Liberia", Code = "LBR", Code2 = "LR", IsActive = true },
            new Country { Name = "Libya", Code = "LBY", Code2 = "LY", IsActive = true },
            new Country { Name = "Liechtenstein", Code = "LIE", Code2 = "LI", IsActive = true },
            new Country { Name = "Lithuania", Code = "LTU", Code2 = "LT", IsActive = true },
            new Country { Name = "Luxembourg", Code = "LUX", Code2 = "LU", IsActive = true },

            // M
            new Country { Name = "Madagascar", Code = "MDG", Code2 = "MG", IsActive = true },
            new Country { Name = "Malawi", Code = "MWI", Code2 = "MW", IsActive = true },
            new Country { Name = "Malaysia", Code = "MYS", Code2 = "MY", IsActive = true },
            new Country { Name = "Maldives", Code = "MDV", Code2 = "MV", IsActive = true },
            new Country { Name = "Mali", Code = "MLI", Code2 = "ML", IsActive = true },
            new Country { Name = "Malta", Code = "MLT", Code2 = "MT", IsActive = true },
            new Country { Name = "Marshall Islands", Code = "MHL", Code2 = "MH", IsActive = true },
            new Country { Name = "Mauritania", Code = "MRT", Code2 = "MR", IsActive = true },
            new Country { Name = "Mauritius", Code = "MUS", Code2 = "MU", IsActive = true },
            new Country { Name = "Mexico", Code = "MEX", Code2 = "MX", IsActive = true },
            new Country { Name = "Micronesia", Code = "FSM", Code2 = "FM", IsActive = true },
            new Country { Name = "Moldova", Code = "MDA", Code2 = "MD", IsActive = true },
            new Country { Name = "Monaco", Code = "MCO", Code2 = "MC", IsActive = true },
            new Country { Name = "Mongolia", Code = "MNG", Code2 = "MN", IsActive = true },
            new Country { Name = "Montenegro", Code = "MNE", Code2 = "ME", IsActive = true },
            new Country { Name = "Morocco", Code = "MAR", Code2 = "MA", IsActive = true },
            new Country { Name = "Mozambique", Code = "MOZ", Code2 = "MZ", IsActive = true },
            new Country { Name = "Myanmar", Code = "MMR", Code2 = "MM", IsActive = true },

            // N
            new Country { Name = "Namibia", Code = "NAM", Code2 = "NA", IsActive = true },
            new Country { Name = "Nauru", Code = "NRU", Code2 = "NR", IsActive = true },
            new Country { Name = "Nepal", Code = "NPL", Code2 = "NP", IsActive = true },
            new Country { Name = "Netherlands", Code = "NLD", Code2 = "NL", IsActive = true },
            new Country { Name = "New Zealand", Code = "NZL", Code2 = "NZ", IsActive = true },
            new Country { Name = "Nicaragua", Code = "NIC", Code2 = "NI", IsActive = true },
            new Country { Name = "Niger", Code = "NER", Code2 = "NE", IsActive = true },
            new Country { Name = "Nigeria", Code = "NGA", Code2 = "NG", IsActive = true },
            new Country { Name = "North Korea", Code = "PRK", Code2 = "KP", IsActive = true },
            new Country { Name = "North Macedonia", Code = "MKD", Code2 = "MK", IsActive = true },
            new Country { Name = "Norway", Code = "NOR", Code2 = "NO", IsActive = true },

            // O
            new Country { Name = "Oman", Code = "OMN", Code2 = "OM", IsActive = true },

            // P
            new Country { Name = "Pakistan", Code = "PAK", Code2 = "PK", IsActive = true },
            new Country { Name = "Palau", Code = "PLW", Code2 = "PW", IsActive = true },
            new Country { Name = "Palestine", Code = "PSE", Code2 = "PS", IsActive = true },
            new Country { Name = "Panama", Code = "PAN", Code2 = "PA", IsActive = true },
            new Country { Name = "Papua New Guinea", Code = "PNG", Code2 = "PG", IsActive = true },
            new Country { Name = "Paraguay", Code = "PRY", Code2 = "PY", IsActive = true },
            new Country { Name = "Peru", Code = "PER", Code2 = "PE", IsActive = true },
            new Country { Name = "Philippines", Code = "PHL", Code2 = "PH", IsActive = true },
            new Country { Name = "Poland", Code = "POL", Code2 = "PL", IsActive = true },
            new Country { Name = "Portugal", Code = "PRT", Code2 = "PT", IsActive = true },

            // Q
            new Country { Name = "Qatar", Code = "QAT", Code2 = "QA", IsActive = true },

            // R
            new Country { Name = "Romania", Code = "ROU", Code2 = "RO", IsActive = true },
            new Country { Name = "Russia", Code = "RUS", Code2 = "RU", IsActive = true },
            new Country { Name = "Rwanda", Code = "RWA", Code2 = "RW", IsActive = true },

            // S
            new Country { Name = "Saint Kitts and Nevis", Code = "KNA", Code2 = "KN", IsActive = true },
            new Country { Name = "Saint Lucia", Code = "LCA", Code2 = "LC", IsActive = true },
            new Country { Name = "Saint Vincent and the Grenadines", Code = "VCT", Code2 = "VC", IsActive = true },
            new Country { Name = "Samoa", Code = "WSM", Code2 = "WS", IsActive = true },
            new Country { Name = "San Marino", Code = "SMR", Code2 = "SM", IsActive = true },
            new Country { Name = "Sao Tome and Principe", Code = "STP", Code2 = "ST", IsActive = true },
            new Country { Name = "Saudi Arabia", Code = "SAU", Code2 = "SA", IsActive = true },
            new Country { Name = "Senegal", Code = "SEN", Code2 = "SN", IsActive = true },
            new Country { Name = "Serbia", Code = "SRB", Code2 = "RS", IsActive = true },
            new Country { Name = "Seychelles", Code = "SYC", Code2 = "SC", IsActive = true },
            new Country { Name = "Sierra Leone", Code = "SLE", Code2 = "SL", IsActive = true },
            new Country { Name = "Singapore", Code = "SGP", Code2 = "SG", IsActive = true },
            new Country { Name = "Slovakia", Code = "SVK", Code2 = "SK", IsActive = true },
            new Country { Name = "Slovenia", Code = "SVN", Code2 = "SI", IsActive = true },
            new Country { Name = "Solomon Islands", Code = "SLB", Code2 = "SB", IsActive = true },
            new Country { Name = "Somalia", Code = "SOM", Code2 = "SO", IsActive = true },
            new Country { Name = "South Africa", Code = "ZAF", Code2 = "ZA", IsActive = true },
            new Country { Name = "South Korea", Code = "KOR", Code2 = "KR", IsActive = true },
            new Country { Name = "South Sudan", Code = "SSD", Code2 = "SS", IsActive = true },
            new Country { Name = "Spain", Code = "ESP", Code2 = "ES", IsActive = true },
            new Country { Name = "Sri Lanka", Code = "LKA", Code2 = "LK", IsActive = true },
            new Country { Name = "Sudan", Code = "SDN", Code2 = "SD", IsActive = true },
            new Country { Name = "Suriname", Code = "SUR", Code2 = "SR", IsActive = true },
            new Country { Name = "Sweden", Code = "SWE", Code2 = "SE", IsActive = true },
            new Country { Name = "Switzerland", Code = "CHE", Code2 = "CH", IsActive = true },
            new Country { Name = "Syria", Code = "SYR", Code2 = "SY", IsActive = true },

            // T
            new Country { Name = "Taiwan", Code = "TWN", Code2 = "TW", IsActive = true },
            new Country { Name = "Tajikistan", Code = "TJK", Code2 = "TJ", IsActive = true },
            new Country { Name = "Tanzania", Code = "TZA", Code2 = "TZ", IsActive = true },
            new Country { Name = "Thailand", Code = "THA", Code2 = "TH", IsActive = true },
            new Country { Name = "Timor-Leste", Code = "TLS", Code2 = "TL", IsActive = true },
            new Country { Name = "Togo", Code = "TGO", Code2 = "TG", IsActive = true },
            new Country { Name = "Tonga", Code = "TON", Code2 = "TO", IsActive = true },
            new Country { Name = "Trinidad and Tobago", Code = "TTO", Code2 = "TT", IsActive = true },
            new Country { Name = "Tunisia", Code = "TUN", Code2 = "TN", IsActive = true },
            new Country { Name = "Turkey", Code = "TUR", Code2 = "TR", IsActive = true },
            new Country { Name = "Turkmenistan", Code = "TKM", Code2 = "TM", IsActive = true },
            new Country { Name = "Tuvalu", Code = "TUV", Code2 = "TV", IsActive = true },

            // U
            new Country { Name = "Uganda", Code = "UGA", Code2 = "UG", IsActive = true },
            new Country { Name = "Ukraine", Code = "UKR", Code2 = "UA", IsActive = true },
            new Country { Name = "United Arab Emirates", Code = "ARE", Code2 = "AE", IsActive = true },
            new Country { Name = "United Kingdom", Code = "GBR", Code2 = "GB", IsActive = true },
            new Country { Name = "United States", Code = "USA", Code2 = "US", IsActive = true },
            new Country { Name = "Uruguay", Code = "URY", Code2 = "UY", IsActive = true },
            new Country { Name = "Uzbekistan", Code = "UZB", Code2 = "UZ", IsActive = true },

            // V
            new Country { Name = "Vanuatu", Code = "VUT", Code2 = "VU", IsActive = true },
            new Country { Name = "Vatican City", Code = "VAT", Code2 = "VA", IsActive = true },
            new Country { Name = "Venezuela", Code = "VEN", Code2 = "VE", IsActive = true },
            new Country { Name = "Vietnam", Code = "VNM", Code2 = "VN", IsActive = true },

            // Y
            new Country { Name = "Yemen", Code = "YEM", Code2 = "YE", IsActive = true },

            // Z
            new Country { Name = "Zambia", Code = "ZMB", Code2 = "ZM", IsActive = true },
            new Country { Name = "Zimbabwe", Code = "ZWE", Code2 = "ZW", IsActive = true }
        };

        await context.Countries.AddRangeAsync(countries);
        await context.SaveChangesAsync();
    }
}
