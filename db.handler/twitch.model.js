const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const twitchSchema = new Schema({
    userId: {
        type: Number,
        required: true,
        unique: true
    },

    twitchId: {
        type: Number
    },

    accessToken: {
        type: String,
    },

    refreshToken: {
        type: String,
    },

    eventSubs: {
        type: Array,
        default: ["channel.cheer", "channel.follow", "channel.subscribe", "channel.subscription.gift", "channel.subscription.message", "channel.chat.message"]
    },
    
    configs: {
        prime: {
            soundUrl: {
                type: String,
                //default: 
            },
            imageUrl: {
                type: String,
                default: 'https://cdn.bynogame.com/logo/bynocan-4-1678386097056.png'
            },
            message: {
                type: String,
                default: '${user} Twitch Prime ile abone oldu!'
            }
        },
        tier1: {
            soundUrl: {
                type: String,
                //default: 
            },
            imageUrl: {
                type: String,
                default: 'https://cdn.bynogame.com/logo/bynocan-4-1678386097056.png'
            },
            message: {
                type: String,
                default: '${user} Tier 1 ile abone oldu!'
            },
            showGift: {
                type: Boolean,
                default: true
            }
        },
        tier2: {
            soundUrl: {
                type: String,
                //default: 
            },
            imageUrl: {
                type: String,
                default: 'https://cdn.bynogame.com/logo/bynocan-4-1678386097056.png'
            },
            message: {
                type: String,
                default: '${user} Tier 2 ile abone oldu!'
            }, 
            showGift: {
                type: Boolean,
                default: true
            }
        },
        tier3: {
            soundUrl: {
                type: String,
                //default: 
            },
            imageUrl: {
                type: String,
                default: 'https://cdn.bynogame.com/logo/bynocan-4-1678386097056.png'
            },
            message: {
                type: String,
                default: '${user} Tier 3 ile abone oldu!'
            }, 
            showGift: {
                type: Boolean,
                default: true
            }
        },
        cheer: {
            soundUrl: {
                type: String,
                //default: 
            },
            imageUrl: {
                type: String,
                default: 'https://cdn.bynogame.com/logo/bynocan-4-1678386097056.png'
            },
            message: {
                type: String,
                default: '${user} ${bits} adet bit gönderdi!'
            }
        },
        follow: {
            soundUrl: {
                type: String,
                //default: 
            },
            imageUrl: {
                type: String,
                default: 'https://cdn.bynogame.com/logo/bynocan-4-1678386097056.png'
            },
            message: {
                type: String,
                default: '${user} takip etti!'
            }
        },
        resub: {
            soundUrl: {
                type: String,
                //default: 
            },
            imageUrl: {
                type: String,
                default: 'https://cdn.bynogame.com/logo/bynocan-4-1678386097056.png'
            },
            message: {
                type: String,
                default: '${user} ${months} ay abone oldu!'
            }
        },
        subgift: {
            soundUrl: {
                type: String,
                //default: 
            },
            imageUrl: {
                type: String,
                default: 'https://cdn.bynogame.com/logo/bynocan-4-1678386097056.png'
            },
            message: {
                type: String,
                default: '${user} ${amount} abonelik hediye etti!'
            }
        },
        submysterygift: {
            soundUrl: {
                type: String,
                //default: 
            },
            imageUrl: {
                type: String,
                default: 'https://cdn.bynogame.com/logo/bynocan-4-1678386097056.png'
            },
            message: {
                type: String,
                default: 'Anonymous ${amount} abonelik hediye etti!'
            }
        },
    }
});

const twitchModel = mongoose.model('Twitch', twitchSchema);

module.exports = twitchModel;