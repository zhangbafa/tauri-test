const list = [
    {
        name:'FunAudioLLM/CosyVoice2-0.5B',
        service:'FunAudioLLM',
        price:'￥50/ M UTF-8 bytes',
        logo:'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/FunAudioLLM.png',
        info:'CosyVoice 2 是一个基于大语言模型的流式语音合成模型，采用统一的流式/非流式框架设计。该模型通过有限标量量化（FSQ）来提升语音 token 的编码本利用率，简化了文本到语音的语言模型架构，并开发了支持不同合成场景的分块感知因果流匹配模型。在流式模式下，模型可实现 150ms 的超低延迟，同时保持与非流式模式几乎相同的合成质量。相比 1.0 版本，发音错误率降低了 30%-50%，MOS 评分从 5.4 提升至 5.53，并支持情感和方言的细粒度控制。支持中文（含方言：粤语、四川话、上海话、天津话等）、英文、日语、韩语，支持跨语言和混合语言场景'
    },
    {
        name:'fishaudio/fish-speech-1.5',
        service:'fish-speech-1.5',
        price:'￥105/ M UTF-8 bytes',
        logo:'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/Fishaudio.svg',
        info:'Fish Speech V1.5 是一款领先的开源文本转语音（TTS）模型。该模型采用创新的 DualAR 架构，包含双自回归变换器设计。它支持多种语言，其中英语和中文各有超过 30 万小时的训练数据，日语超过 10 万小时。在 TTS Arena 的独立评估中，模型表现出色，ELO 评分为 1339。模型在英文单词错误率（WER）和字符错误率（CER）方面分别达到了 3.5% 和 1.2%，中文字符错误率为 1.3%'
    },
    {
        name:'fishaudio/fish-speech-1.4',
        service:'fish-speech-1.4',
        price:'￥105/ M UTF-8 bytes',
        logo:'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/Fishaudio.svg',
        info:'Fish Speech V1.4 是一个先进的文本转语音（TTS）模型，在 70 万小时的多语言音频数据上训练而成。该模型支持 8 种语言，包括约 30 万小时的英语和中文数据，以及各约 2 万小时的德语、日语、法语、西班牙语、韩语和阿拉伯语数据。这使其成为一个强大的多语言语音合成解决方案'
    },
    {
        name:'RVC-Boss/GPT-SoVITS',
        service:'GPT-SoVITS',
        price:'￥50/ M UTF-8 bytes',
        logo:'',
        info:'GPT-SoVITS 是一个强大的少样本语音转换和文本转语音系统。其最显著的特点是仅需 1 分钟的训练数据即可实现高质量的声音克隆。模型支持零样本 TTS（仅需 5 秒语音样本）和少样本 TTS（使用 1 分钟训练数据进行微调）两种模式。该模型具有跨语言能力，支持英文、日文、韩文、粤语和中文等多种语言的推理，并集成了语音伴奏分离、自动训练集分割、中文 ASR 等实用工具'
    },
    {
        name:'LoRA/RVC-Boss/GPT-SoVITS',
        service:'GPT-SoVITS (LoRA)',
        price:'￥50/ M UTF-8 bytes',
        logo:'',
        info:'GPT-SoVITS 是一个强大的少样本语音转换和文本转语音系统。其最显著的特点是仅需 1 分钟的训练数据即可实现高质量的声音克隆。模型支持零样本 TTS（仅需 5 秒语音样本）和少样本 TTS（使用 1 分钟训练数据进行微调）两种模式。该模型具有跨语言能力，支持英文、日文、韩文、粤语和中文等多种语言的推理，并集成了语音伴奏分离、自动训练集分割、中文 ASR 等实用工具'
    }
]
