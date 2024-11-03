type ImgUtilOptions = {
	width?: number
	height?: number
}

export class ImgUtil {
	private src: Blob | string
	private img: HTMLImageElement
	private canvas: HTMLCanvasElement

	private constructor(
		src: Blob | string,
		canvas: HTMLCanvasElement,
		img: HTMLImageElement,
	) {
		this.img = img
		this.src = src
		this.canvas = canvas
	}

	private static createCanvas(
		src: Blob | string,
		options: ImgUtilOptions = {},
	): Promise<{ canvas: HTMLCanvasElement; image: HTMLImageElement }> {
		return new Promise((resolve, reject) => {
			const canvas = document.createElement('canvas')
			const ctx = canvas.getContext('2d')

			if (!ctx) {
				return reject(new Error('Canvas context not available.'))
			}

			const isBlob = src instanceof Blob

			const image = new Image()
			image.crossOrigin = 'Anonymous'
			image.onload = () => {
				canvas.width = options.width || image.width
				canvas.height = options.height || image.height
				ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
				isBlob && URL.revokeObjectURL(image.src)
				resolve({ canvas, image })
			}

			image.onerror = () => {
				isBlob && URL.revokeObjectURL(image.src)
				reject(new Error('Image loading error.'))
			}

			image.src = isBlob ? URL.createObjectURL(src) : src
		})
	}

	private get context() {
		const ctx = this.canvas.getContext('2d')

		if (!ctx) throw new Error('Canvas context not available.')

		return ctx
	}

	public static async from(src: Blob | string, options?: ImgUtilOptions) {
		const { canvas, image } = await ImgUtil.createCanvas(src, options)
		return new ImgUtil(src, canvas, image)
	}

	public resize(scale: number): ImgUtil
	public resize(width: number, height?: number): ImgUtil {
		if (height === undefined) {
			const ratio = this.img.width / this.img.height
			height = Math.max(1, width / ratio)
		}

		this.canvas.width = width
		this.canvas.height = height

		this.context.drawImage(this.img, 0, 0, width, height)
		return this
	}

	public blur(strength: number) {
		this.context.filter = `blur(${strength}px)`
		return this
	}

	public async toBlob() {
		return await new Promise<Blob>((resolve, reject) => {
			this.canvas.toBlob((data) => {
				data ? resolve(data) : reject(new Error('Image conversion error.'))
			}, 'image/webp')
		})
	}
}

export const bufferToBlob = (buffer: Buffer) => new Blob([buffer])
