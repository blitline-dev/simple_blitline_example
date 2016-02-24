require 'sinatra'
require 'time'
require 'base64'
require 'json'
require 'digest/sha1'

get '/' do
  hex = SecureRandom.hex # Random name
  key = "image/#{hex}" + ".jpg"
  policy = s3_upload_policy_document(key)
  variables = {
  	aws_access_token: ENV['AWS_ACCESS_KEY'],
  	key: key,
  	policy: policy,
  	signature: s3_upload_signature(policy),
  	bucket: ENV['AWS_BUCKET']
  }
  variables.merge!(signed_blitline_values)
  p variables.inspect
  erb :index, locals: variables
end

def s3_upload_policy_document(key)
	ret = {
	  "expiration" => (Time.now + 3600).utc.xmlschema,
	  "conditions" =>
	  [
	    { "bucket" =>  ENV['AWS_BUCKET'] },
	    ["starts-with", "$key", key],
	    { "acl" => "public-read" },
	    ["starts-with", "$Content-Type", "image/"],
	    { "success_action_status" => "200" }
	  ]
	}
	Base64.encode64(ret.to_json).gsub(/\n/, '')
end

def s3_upload_signature(policy)
	Base64.encode64(OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new('sha1'), ENV['AWS_SECRET_KEY'], policy)).delete("\n")
end

def signed_blitline_values
	# This allows you to sign a Blitline request. This means you can
	# submit to Blitline via Javascript without giving the end user
	# you Blitline Application ID.
	my_secret = ENV["BLITLINE_SECRET"]
	expires = Time.now + 3600
	key_transform = "^image"
	values = {
		public_token: ENV["BLITLINE_PUBLIC_TOKEN"],
		expires: expires,
		key_transform: key_transform,
		signature: Digest::SHA1.hexdigest(my_secret + expires.rfc822 + key_transform)
	}
	return values
end
